# Use Node 20 for React frontend (Vite)
FROM node:20-alpine

WORKDIR /app

# Copy package.json & package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Expose Vite default port
EXPOSE 5173

# Default command to start Vite on all network interfaces
CMD ["npm", "start"]
