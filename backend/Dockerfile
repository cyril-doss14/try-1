# Use Node 18 as base
FROM node:18

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose the backend port
EXPOSE 5001

# Start the server
CMD ["node", "server.js"]