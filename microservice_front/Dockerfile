FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "src/app.js"]

# RUN apt-get update && \
#     apt-get install -y nginx && \
#     apt-get clean && \
#     rm -rf /var/lib/apt/lists/*

# WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
# RUN rm -rf ./*

# Copy static assets
# COPY public /usr/share/nginx/html

# Copy custom nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
# EXPOSE 80

# Start Nginx server
# CMD ["nginx", "-g", "daemon off;"]
