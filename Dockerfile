# Step 1: Build frontend
FROM node:18 AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend ./frontend
RUN cd frontend && npm run build

# Step 2: Build backend
FROM node:18
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend source
COPY backend ./backend

# Copy frontend build into backend public folder
COPY --from=frontend-builder /app/frontend/build ./backend/public

# Set working directory to backend
WORKDIR /app/backend

# Expose backend port
EXPOSE 5001

# Start the server
CMD ["node", "server.js"]