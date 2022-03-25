# Gathering alpine for building
#FROM node:10-alpine as build-step
FROM node:latest as build-step

# create home app
RUN mkdir /app

# Set workdir
WORKDIR /app

# Copy to install dep
COPY package.json /app

RUN npm install

RUN mkdir -p node_modules/.cache && chmod -R 777 node_modules/.cache
# Copy source code
COPY . /app

# Build npm
CMD ["npm", "run", "start"]

# Use other alpine to set nginx to redirect req to home app
# # Stage 2
# FROM nginx:1.17.1-alpine
# 
# # Expose 80 port for NGINX CONTAINER, secure https container
# EXPOSE 80
# 
# # Take build dir from earlier image
# COPY --from=build-step /app/build /usr/share/nginx/html
