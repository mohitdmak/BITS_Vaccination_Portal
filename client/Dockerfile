# Gathering alpine for building
FROM node:10-alpine as build-step

# create home app
RUN mkdir /app

# Set workdir
WORKDIR /app

# Copy to install dep
COPY package.json /app

RUN npm install

# Copy source code
COPY . /app

# Build npm
RUN npm run build

# Use other alpine to set nginx to redirect req to home app
# Stage 2
FROM nginx:1.17.1-alpine

# Expose 80 port for NGINX CONTAINER, secure https container
EXPOSE 80

# Take build dir from earlier image
COPY --from=build-step /app/build /usr/share/nginx/html
