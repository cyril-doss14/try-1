# Base image
FROM node:18

# Working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose React port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]