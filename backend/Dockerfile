# Use a secure and lightweight Node.js image
FROM node:23-alpine

# Define build-time arguments with default values
ARG NODE_ENV=development
ARG APP_VERSION=1.0.0
ARG GIT_COMMIT=local

# Set environment variables used at runtime
ENV NODE_ENV=$NODE_ENV
ENV APP_VERSION=$APP_VERSION
ENV GIT_COMMIT=$GIT_COMMIT
ENV PORT=5000

# Set the working directory inside the container
WORKDIR /app

# Install only necessary dependencies
# - In production: skips dev dependencies
# - In development: installs everything
COPY package*.json ./
RUN if [ "$NODE_ENV" = "production" ]; then npm ci --omit=dev; else npm ci; fi

# Copy the application source code
COPY . .

# Add metadata labels for image documentation
LABEL org.opencontainers.image.version="${APP_VERSION}"
LABEL org.opencontainers.image.revision="${GIT_COMMIT}"
LABEL org.opencontainers.image.title="Timeless Backend"
LABEL org.opencontainers.image.description="Backend API for Timeless Watch Rental Application"
LABEL org.opencontainers.image.authors="Timeless Dev Team"
LABEL org.opencontainers.image.environment="${NODE_ENV}"

# Expose the backend API port
EXPOSE 5000

# Start backend server
# - In production: run compiled server with Node.js
# - In development: use built-in `node --watch` to reload on file changes
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = 'production' ]; then node src/index.js; else node --watch src/index.js; fi"]
