# BITS Vaccination Portal

[![Deploy to Lightsail](https://github.com/mohitdmak/BITS_Vaccination_Portal/actions/workflows/deploy.yml/badge.svg)](https://github.com/mohitdmak/BITS_Vaccination_Portal/actions/workflows/deploy.yml)
[![Publish Docker image to Dockerhub](https://github.com/mohitdmak/BITS_Vaccination_Portal/actions/workflows/docker-image.yml/badge.svg)](https://github.com/mohitdmak/BITS_Vaccination_Portal/actions/workflows/docker-image.yml)
[![Linting](https://github.com/mohitdmak/BITS_Vaccination_Portal/actions/workflows/lint.yml/badge.svg)](https://github.com/mohitdmak/BITS_Vaccination_Portal/actions/workflows/lint.yml)
[![Docker](https://badgen.net/badge/icon/docker?icon=dockerhub&label=ContainerRegistry)](https://hub.docker.com/r/mohitdmak/bits_vaccination_portal)

## Setup
1. Setup Authentication:
  * Create a new project at https://console.cloud.google.com/ and get ClientId and Secret for an Oauth2 Api
  * Download credentials to `src/config/oauth2-api-creds.json`
2. Setup Mongo Database:
  * Prepare .env file in `src/config/mongo.env` with following properties:
    - *MONGO_INITDB_ROOT_USERNAME*
    - *MONGO_INITDB_ROOT_PASSWORD*
    - *MONGO_INITDB_DATABASE*
  * Also create `src/config/mongo.ts` to export above creds to controllers.
  * Prepare credentials at `src/config/DB_ADMIN_CONFIG.env` for SuperAdmin (MongoExpress) Container:
    - ME_CONFIG_BASICAUTH_USERNAME
    - ME_CONFIG_BASICAUTH_PASSWORD
    - ME_CONFIG_MONGODB_PORT
    - ME_CONFIG_MONGODB_ENABLE_ADMIN
    - ME_CONFIG_MONGODB_SERVER
  * Also edit container settings for mongo at `src/db/db.conf`
3. Session, Admin Portal config:
  * Export a **SESSION_SECRET** from `src/config/session-secret.ts`
  * Also edit container settings for redis at `src/redis/redis.conf`
  * Export a *username*, *password*, *hashed* from  `src/config/admin.ts` for ADMIN Portal
4. Development, Project config:
  * Create `src/config/APP.env` with values of *development*/*production* for:
    - REACT_APP_CLIENT_ENV
    - REACT_APP_ADMIN_CLIENT_ENV
    - API_ENV
  * Create dev/prod web server config at `src/nginx/nginx.conf`
  * The respective docker containers will use Hosts and Build settings as specified in this file.
  * Edit current project constants/settings at `src/setup_project.ts`

## Run/Build
1. Setup docker and docker-compose: 
  * This requires your machine to have Docker runtime installed.
    - [Mac OS](https://docs.docker.com/docker-for-mac/install/), [Windows](https://docs.docker.com/docker-for-windows/install/), [Linux](https://docs.docker.com/engine/install/) (Browse by distributions)
  * Further Install docker compose https://docs.docker.com/compose/install/
  * Create a docker user group to not require running as sudo
2. Build containers:
  - Either build or pull containers: `docker-compose build` or `docker-compose pull`
  - Run as: `docker-compose up -d`, preferrably install https://github.com/jesseduffield/lazydocker for quick logs view
  - Else, access pino logs at `src/middeware/error_logs`
3. Regular Tasks:
  * Customize `src/backup_script.sh` and create a crontab (https://man7.org/linux/man-pages/man5/crontab.5.html) to run it every few hours.
  * Also create complimentory repository for versioning database backups, edit it in the backup script.
