FROM node:20-slim AS base
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "run", "start"]
