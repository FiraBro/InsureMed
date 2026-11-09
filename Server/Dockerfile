FROM node:20-alpine

WORKDIR /app

# Update npm to the latest version to avoid the log warning
RUN npm install -g npm@latest

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]