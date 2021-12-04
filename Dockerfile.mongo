# Not taking latest here as it has completely disabled rest and http access to mongod process
FROM mongo:3.4

# Working dir
WORKDIR /data

# Using custom configs for mongo
COPY ./db/mongod.conf /etc/mongod.conf

# expose MongoDB's default port of 27017
EXPOSE 27017

# Expose HTTP Port too
# Superadmin probably accesses collections via this port
EXPOSE 28017

# Start mongod service
CMD ["mongod"]
