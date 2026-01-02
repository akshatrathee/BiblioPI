# Stage 1: Build the React Application
FROM node:20-alpine as build

WORKDIR /app

# Copy package files for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Security: Remove default configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the configured port (matching the USER's preference)
EXPOSE 9090

# Runtime configuration script
# Generates env-config.js from environment variables at container startup
# This allows the same Docker image to be used with different API keys
# Improved security: uses a dedicated script and handles more variables
RUN printf "#!/bin/sh\n\
    echo \"window.env = {\" > /usr/share/nginx/html/env-config.js\n\
    [ -n \"\$API_KEY\" ] && echo \"  API_KEY: \\\"\$API_KEY\\\",\" >> /usr/share/nginx/html/env-config.js\n\
    [ -n \"\$OLLAMA_HOST\" ] && echo \"  OLLAMA_HOST: \\\"\$OLLAMA_HOST\\\",\" >> /usr/share/nginx/html/env-config.js\n\
    [ -n \"\$DB_HOST\" ] && echo \"  DB_HOST: \\\"\$DB_HOST\\\",\" >> /usr/share/nginx/html/env-config.js\n\
    echo \"};\" >> /usr/share/nginx/html/env-config.js\n\
    exec nginx -g \"daemon off;\"\n" > /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Security: Run as non-root (Nginx alpine default setup usually requires root for port 80/443, 
# but we are using 9090. To be truly secure, we'd need to change ownership of nginx dirs)
# For now, we'll keep it simple but cleaner.

ENTRYPOINT ["/docker-entrypoint.sh"]