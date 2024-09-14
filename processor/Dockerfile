FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
Run npm install prisma
COPY . .
Run npx prisma generate
RUN npm run build
EXPOSE 3003
CMD ["npm","run","start"]
