import { embedMany, embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { MDocument, rerank } from "@mastra/rag";
import { createVectorQueryTool } from "@mastra/rag";
import { mastra } from "..";
import { readdir, readFile } from 'fs/promises';
import { join, extname, basename } from 'path';

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
  const rootDirectory = join('../../src/content/fiche-de-chris');
  const markdownFiles = await collectMarkdownFiles(rootDirectory, []);
  const vectorStore = mastra.getVector('pgVector');
  const indexName = 'myCollection';
  try {
    await vectorStore.deleteIndex({ indexName });
  } catch (error) {
    console.warn(`Index '${indexName}' could not be deleted or did not exist:`, error);
  }
  for (const filePath of markdownFiles) {
    const content = await readFile(filePath, 'utf8');
    console.log("content !!", content);
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


    await vectorStore.createIndex({
      indexName: 'myCollection',
      dimension: 1536,
    });
    await vectorStore.upsert({
      indexName: "myCollection",
      vectors: embeddings,
      metadata: chunks.map(chunk => ({
        text: chunk.text,
        source: 'fiche-de-chris'
      })),
    });
  }
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