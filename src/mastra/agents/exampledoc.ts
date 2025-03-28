import { embedMany, embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { PgVector } from "@mastra/pg";
import { MDocument, rerank } from "@mastra/rag";
import { z } from "zod";
import { createVectorQueryTool } from "@mastra/rag";
import { mastra } from "../../mastra";
import { readdir, readFile } from 'fs/promises';
import { join, extname, basename } from 'path';
// 1. Initialize document
const doc = MDocument.fromMarkdown(`
 # La consommation de l'IT et le BYOD

## Contexte

**Définition​**

- La consumérisation désigne le mélange des utilisations personnelle et professionnelle des technologies, particulièrement chez les jeunes employés mobiles.​

**Exemple** ​

- Usage de WhatsApp pour des communications professionnelles, malgré son design pour usage privé.​

**Impact sur les services informatiques​**

- Les services doivent gérer des technologies personnelles tout en sécurisant les réseaux professionnels.​

**Flux inversé d’innovation​**

- Les innovations grand public s'intègrent dans les entreprises après avoir pénétré les foyers.

**LE BYOD​**

Le BYOD (Bring Your Own Device) est l'une des manifestations les plus évidentes de la consumérisation de l’informatique. ​
​
En permettant aux employés d’utiliser leurs appareils personnels (smartphones, tablettes, ordinateurs) pour accéder aux systèmes d’entreprise, le BYOD matérialise ce mélange des sphères personnelle et professionnelle

**Etude du BYOD**

![BYOD Etude](./assets/BYODetude.png)

Référence : [BYOD Etude](https://www.grandviewresearch.com/industry-analysis/bring-your-own-device-market)

2ème étude :

![BYOD Etude 2ème étude](./assets/Etude2Byod.png)

Référence : [BYOD Etude 2ème étude](https://www.mordorintelligence.com/fr/industry-reports/byod-market
)


## Enjeux

**Enjeu Technologique**

- Comment gérer la diversité des appareils personnels tout en garantissant la sécurité et la compatibilité ?​

**Enjeu Ecologique :​**

- Le BYOD permet-il de réduire l’impact environnemental des équipements numériques en entreprise ?​

**Enjeu Légal​**

- Quels sont les risques juridiques liés à la confidentialité et à la protection des données personnelles dans un cadre BYOD ?​



## Références

Context :

https://www.lemagit.fr/definition/Consumerisation-de-linformatique#:~:text=La%20consum%C3%A9risation%20de%20l'informatique,la%20consum%C3%A9risation%20de%20l'informatique.


https://www.marketsandmarkets.com/Market-Reports/enterprise-mobility-334.html   
    
`);


/**
 * Génère un identifiant unique à partir du chemin du fichier.
 * @param {string} filePath - Chemin complet du fichier.
 * @returns {string} Identifiant unique généré.
 */
function generateDocumentId(filePath) {
  return filePath.replace(/[\/\\]/g, '_');
}

/**
 * Parcourt récursivement un dossier pour collecter les fichiers Markdown,
 * en excluant ceux dont le nom figure dans le tableau d'exclusions.
 *
 * @param {string} directory - Dossier à parcourir.
 * @param {Array<string>} exclude - Tableau de noms de fichiers à exclure (en minuscules, par exemple ['readme.md']).
 * @returns {Promise<string[]>} Liste des chemins complets vers les fichiers Markdown.
 */
async function collectMarkdownFiles(directory, exclude = []) {
  let markdownFiles = [] as any;
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      const subDirFiles = await collectMarkdownFiles(fullPath, exclude);
      markdownFiles = markdownFiles.concat(subDirFiles);
    } else if (extname(entry.name).toLowerCase() === '.md') {
      // Vérifier que le fichier ne fait pas partie des fichiers à exclure
      if (!exclude.includes(basename(entry.name).toLowerCase())) {
        markdownFiles.push(fullPath);
      }
    }
  }
  return markdownFiles;
}



export async function initVector() {
  const markdownFiles = await collectMarkdownFiles(directory, exclude);

  for (const filePath of markdownFiles) {
    const content = await readFile(filePath, 'utf8');
    const doc = MDocument.fromMarkdown(content)
    // 2. Create chunks
    const chunks = await doc.chunk({
      strategy: "recursive",
      size: 512,
      overlap: 50,
    });

    // 3. Generate embeddings; we need to pass the text of each chunk
    const { embeddings } = await embedMany({
      values: chunks.map(chunk => chunk.text),
      model: openai.embedding("text-embedding-3-small"),
    });

    const vectorStore = mastra.getVector('pgVector');

    await vectorStore.createIndex({
      indexName: 'myCollection',
      dimension: 1536,
    });
    await vectorStore.upsert({
      indexName: "myCollection",
      vectors: embeddings,
      metadata: chunks.map(chunk => ({
        text: chunk.text,
        source: 'transformer-paper'
      })),
    });
  }
  // const query = 'explain boyd';

  // // Get query embedding
  // const { embedding: queryEmbedding } = await embed({
  //   value: query,
  //   model: openai.embedding('text-embedding-3-small'),
  // });

  // // Get initial results
  // const initialResults = await vectorStore.query({
  //   indexName: 'myCollection',
  //   queryVector: queryEmbedding,
  //   topK: 3,
  // });

  // // Re-rank results
  // const rerankedResults = await rerank(initialResults, query, openai('gpt-4o-mini'), {
  //   weights: {
  //     semantic: 0.5,  // How well the content matches the query semantically
  //     vector: 0.3,    // Original vector similarity score
  //     position: 0.2   // Preserves original result ordering
  //   },
  //   topK: 3,
  // });
  // console.log("Initial results !!",initialResults);
  // console.log("Rerank !!",rerankedResults);

}

export const vectorQueryTool = createVectorQueryTool({
  vectorStoreName: 'pgVector',
  indexName: 'myCollection',
  model: openai.embedding('text-embedding-3-small'),
  // description: "Search through our documentation to find relevant information about BYOD topic.",
  reranker: {
    model: openai("gpt-4o-mini"),
  },
});