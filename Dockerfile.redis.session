# Getting non alpine latest
FROM redis:latest

# Overriding defaults custom conf
COPY redis/redis.conf /usr/local/etc/redis/redis.conf

# Exposing working port for other containers to access
EXPOSE 7000

# Set password for redis
# ENV REDIS_PASSWORD "redis_password"

# Using redis.conf
CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
