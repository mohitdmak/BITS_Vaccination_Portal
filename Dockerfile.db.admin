
# PULL MONGO_EXPRESS IMAGE LATEST
FROM mongo-express:latest


# CREDS FROM CONFIG DIR
# ENV_FILE  

# configuring above in compose file instead,
# container dockerfile needed only to expose working port to NGINX container
# THis allows us to provide db admin on https connection,
# instead of exposing it to 0.0.0.0 on local:8080
EXPOSE 8081

# FINAL COMMAND
# CMD ["echo 'DB ADMIN PANNEL RUNNING . . .'"]
