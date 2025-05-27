# Use a secure and lightweight Node.js base image
FROM node:23-alpine

# Define build-time arguments with default values
ARG NODE_ENV=development
ARG APP_VERSION=1.0.0
ARG GIT_COMMIT=local

# Set environment variables available at runtime
ENV NODE_ENV=$NODE_ENV
ENV APP_VERSION=$APP_VERSION
ENV GIT_COMMIT=$GIT_COMMIT

# Set the working directory inside the container
WORKDIR /app

# Copy dependency definitions first to leverage Docker cache
COPY package*.json ./

# Install all frontend dependencies using a clean install
RUN npm ci

# Copy the rest of the frontend source code
COPY . .

# In production mode, build the static frontend (output goes to /app/dist)
RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi

# Add Open Container Initiative (OCI) metadata for traceability
LABEL org.opencontainers.image.version="${APP_VERSION}"
LABEL org.opencontainers.image.revision="${GIT_COMMIT}"
LABEL org.opencontainers.image.title="Timeless Frontend"
LABEL org.opencontainers.image.description="Frontend UI for Timeless Watch Rental Application"
LABEL org.opencontainers.image.authors="Timeless Dev Team"
LABEL org.opencontainers.image.environment="${NODE_ENV}"

# Expose the Vite development server port (used in development mode)
EXPOSE 5173

# Start the frontend app
# - In development: run Vite dev server on all interfaces (`--host`)
# - In production: install and use `serve` to serve the built static site
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = 'production' ]; then npm install -g serve && serve -s dist; else npm run dev -- --host; fi"]
