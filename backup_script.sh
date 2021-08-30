#!/bin/bash

# ENTER MONGO CONTAINER, DUMP FILES TO /backups, COPY OVER TO LOCAL REPO
sudo docker exec MongoContainer sh -c 'exec mongodump --out /backups' && sudo docker cp MongoContainer:/backups /home/dvmuser/backup_vaccination_portal

# COMMIT NEW BACKUP, PUSH TO HOSTED REPO
cd /home/dvmuser/backup_vaccination_portal && git status && git add . && git commit -m "Regular Backup . . ." && git push
