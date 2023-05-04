# Avoiding alpine here
FROM nginx:1-bullseye

# Confirmatory echo
RUN echo "\n    Spinning up nginx container\n"

# daemon has to be off
CMD ["nginx", "-g", "daemon off;"]

