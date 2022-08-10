# Avoiding alpine here
FROM nginx:stable

# Confirmatory echo
RUN echo "\n    Spinning up nginx container\n"

# daemon has to be off
CMD ["nginx", "-g", "daemon off;"]

