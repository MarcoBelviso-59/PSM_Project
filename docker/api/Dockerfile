FROM node:20-alpine

WORKDIR /app

# Copiamo solo i package per sfruttare cache
COPY src/api/package*.json ./src/api/

# Install deps API
RUN cd src/api && npm ci --omit=dev

# Copiamo il codice necessario: API + Engine + Experiments (per leggere outputs)
COPY src/api ./src/api
COPY src/engine ./src/engine
COPY src/experiments ./src/experiments

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/api/server.js"]
