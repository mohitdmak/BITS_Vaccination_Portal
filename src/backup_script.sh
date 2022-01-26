#!/bin/bash

# Where scripts go to fail
die() {
    # echo error message to stderr by piping from stdout
  echo "FAIL"
  echo "$*" 1>&2
  exit 1
}

# ENTER MONGO CONTAINER, DUMP FILES TO /backupa
sudo docker exec MongoContainer sh -c 'exec mongodump --out /backups' || die "\n     Unable to exec and dump out a backup from mongo container"

# Copy over backups dump to backup repository local branch
sudo docker cp MongoContainer:/backups /home/dvmuser/backup_vaccination_portal || die "\n     Unable to copy created backup to local backups repository"

# COMMIT NEW BACKUP, PUSH TO HOSTED REPO
cd /home/dvmuser/backup_vaccination_portal 
    && git status \  
    && git add .  \ 
    && git commit -m "Regular Backup . . ." || die "\n     Unable to create git commit for procured backup"\ 
    && git push  || die "\n       Unable to push to remote backup repository." \  
