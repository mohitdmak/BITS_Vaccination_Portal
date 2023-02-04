# Avoiding alpine here
FROM nginx:1.23

# Confirmatory echo
RUN echo "\n    Spinning up nginx container\n"

# daemon has to be off
CMD ["nginx", "-g", "daemon off;"]

