# Phase de build
FROM node:lts AS builder
ENV NODE_OPTIONS="--max_old_space_size=4096"
WORKDIR /app
RUN npm install -g pnpm
# Copier les fichiers de configuration et installer les dépendances
COPY package*.json ./
RUN pnpm i

# Copier l'intégralité du code source
COPY . .

# Lancer la commande de build
RUN npm run build

# Phase finale (runtime)
FROM node:lts-alpine
WORKDIR /app
RUN mkdir -p /app/src/content /app/.mastra/output /app/.mastra/.build
# Copier uniquement les fichiers compilés
COPY --from=builder /app/.mastra/output /app/.mastra/output
COPY --from=builder /app/.mastra/.build /app/.mastra/.build
# Copier récursivement le dossier content
COPY --from=builder /app/src/content ./src/content

WORKDIR /app/.mastra/output

CMD ["node", "index.mjs"]
