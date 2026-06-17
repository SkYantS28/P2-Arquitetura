FROM node:22-alpine

WORKDIR /app

COPY package.json tsconfig.json ./
COPY src ./src

RUN npm install

EXPOSE 3001

CMD ["npm", "run", "dev"]
