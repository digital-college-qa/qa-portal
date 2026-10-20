FROM mcr.microsoft.com/playwright:v1.62.1-noble
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --ignore-scripts --omit=dev --no-audit --no-fund && npm cache clean --force
WORKDIR /app
COPY . .
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 HOME=/tmp/qa-home
USER pwuser
EXPOSE 3000
CMD ["node", "server/index.mjs"]
