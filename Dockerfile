FROM node:latest

WORKDIR /app
ADD . .
RUN npm install
RUN npm ci

CMD ["npm", "run", "dev"]