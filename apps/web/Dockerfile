FROM node:22-alpine

WORKDIR /app

COPY package.json tsconfig.json tsconfig.app.json vite.config.ts tailwind.config.js postcss.config.js index.html ./
COPY src ./src

RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev"]
