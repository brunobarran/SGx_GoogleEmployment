FROM node:20-alpine

# Instalar wget para healthcheck
RUN apk add --no-cache wget

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci

# Copiar código
COPY . .

# Build producción
RUN npm run build

EXPOSE 4173

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4173/installation.html || exit 1

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
