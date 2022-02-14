# BITS Vaccination Portal

[![Deploy to Lightsail](https://github.com/mohitdmak/BITS_Vaccination_Portal/actions/workflows/deploy.yml/badge.svg)](https://github.com/mohitdmak/BITS_Vaccination_Portal/actions/workflows/deploy.yml)
[![Publish Docker image to Dockerhub](https://github.com/mohitdmak/BITS_Vaccination_Portal/actions/workflows/docker-image.yml/badge.svg)](https://github.com/mohitdmak/BITS_Vaccination_Portal/actions/workflows/docker-image.yml)
[![Linting](https://github.com/mohitdmak/BITS_Vaccination_Portal/actions/workflows/lint.yml/badge.svg)](https://github.com/mohitdmak/BITS_Vaccination_Portal/actions/workflows/lint.yml)
[![Docker](https://badgen.net/badge/icon/docker?icon=dockerhub&label=ContainerRegistry)](https://hub.docker.com/r/mohitdmak/bits_vaccination_portal)

## Contents:
 - [Rest API Docs](#api)
 - [Problem Description](#problem)
 - [Setup Server](#server)
 - [Setup Client](#client)
 - [Build/Run](#run)
 - [Developers](#devs)
 - [License](#lic)
 
## Api <a name="api"></a>
* Rest API documentation is hosted using [apidoc](https://apidocjs.com/#demo) at [gh pages](https://mohitdmak.github.io/BITS_Vaccination_Portal/)


_As the BITS Pilani campus reopens for students of the all batches, a cornerstone of the process has been the Vaccination Portal, a comprehensive system developed by students from DVM to verify student’s vaccination statuses and smoothen the process for the administration._

**BITS Pilani, Pilani campus is one of the first campuses in India to incorporate such a system to ensure a safe return of its students.\***

## Project Description <a name="problem"></a>

### Problem Statement

With more than 2500 students being called back to campus as the pandemic eased up, we needed to find a way to ensure that students were vaccinated and being safe about their arrival. The immediate problem was to have a system to verify whether students were vaccinated, track how many vaccines they had received, ensure the validity of each certificate, and track where students were returning to campus from. Without automating this process, it would be a mountain of data for the administration to have to manually sit and verify.

### Research

As soon as we heard that the campus would be re-opening, we realised the impossible task that SWD would have to undertake in order to manually scan thousands of certificates and manually keep track of student data in various sources. We started to research and try to find a way to automatically verify students’ vaccination status and have all the data in a single-source-of-truth database for easy access.

### Implementation

After extensively reading and analysing the Indian Government’s CoWIN API (official application programming interface), we devised an automated solution to read PDFs and verify them with the official Government database. The system was simple — a student would upload their PDF, the backend would process the document, read the QR code, transpile the data and then query it against the Government database. We then cross-referenced the data with the student’s data according to their BITS email address and returned a vaccination status for the student.

This, while being a near-perfect solution, still left out certain edge cases. For example, students who might not have been vaccinated in India, or students who had different names on their certificate and BITS email. Thus, we also built a manual verification system — in case a student had certain difficulties with being automatically verified, an authorised member of SWD could log into a backend interface and manually verify the students.

### Platform

Having sorted out the logic and functioning of the portal, we now needed to devise a clean and easy-to-use interface for both the student body and the admin personnel at SWD. Thus, we built two separate portals — https://vaccination.bits-dvm.org for the student body, and https://vaccination-admin.bits-dvm.org for SWD.

<img src="https://i.imgur.com/LKQbhCm.png" alt="BITS Vaccine Portal — Students" style="width:80%;"/>

The student portal is a clean interface that allows only certain batches to access the portal at one time. Once approved students log in with their BITS email, they can quickly see their vaccination status. They are then able to upload their vaccine certificate, signed parents consent form, date of arrival, location, and agree to certain health declarations. Once they add all their details, the lightning-fast portal updates instantly with the student’s new vaccination status.

<img src="https://i.imgur.com/4sEUqdC.png" alt="BITS Vaccine Portal — Admin" style="width:80%;"/>

The admin portal is a functional tool for the SWD team to quickly access any details they may require. Any authenticated member has controls over which batches can currently update their vaccination details. They also have the power to instantly download a physical copy of all the students in an Excel spreadsheet format. On the admin portal, they can filter down the students by batches/vaccination status/date of arrival or search by name in order to quickly access a group of students at once. Each student has their own page where the admin can see all their details, the uploaded PDFs and even manually update their status.

### Usage

The reception to the portal has been amazing — students of all batches and branches alike have commended the easy-to-use nature of the portal and were easily able to provide all the requested data to the SWD. After two batches have used this portal to submit their information, the SWD now has access to all the data without having to manually scan even a single certificate in one, consolidated database.

<img src="https://imgur.com/9pYU2Ea.png" alt="BITS Vaccine Portal — Analytics" style="width:60%; border: 10px solid white;"/>

With over 4.5k users to date and counting, we’re extremely proud of the Vaccine Portal and honoured to be able to share this with our student body and the BITS administration.

_(last updated on 12th September, 2021)_


## Setup <a name="server"></a>
1. Setup Authentication:
  * Create a new project at https://console.cloud.google.com/ and get ClientId and Secret for an Oauth2 Api
  * Download credentials to `src/config/oauth2-api-creds.json`
2. Setup Mongo Database:
  * Prepare .env file in `src/config/mongo.env` with following properties:
    - *mongo_initdb_root_username*
    - *mongo_initdb_root_password*
    - *mongo_initdb_database*
  * Also create `src/config/mongo.ts` to export above creds to controllers.
  * Prepare credentials at `src/config/DB_ADMIN_CONFIG.env` for SuperAdmin (MongoExpress) Container:
    - *me_config_basicauth_username*
    - *me_config_basicauth_password*
    - *me_config_mongodb_port*
    - *me_config_mongodb_enable_admin*
    - *me_config_mongodb_server*
  * Also edit container settings for mongo at `src/db/db.conf`
3. Session, Admin Portal config:
  * Export a **SESSION_SECRET** from `src/config/session-secret.ts`
  * Also edit container settings for redis at `src/redis/redis.conf`
  * Export a *username*, *password*, *hashed* from  `src/config/admin.ts` for ADMIN Portal
4. Development, Project config:
  * Create `src/config/APP.env` with values of *development*/*production* for:
    - *react_app_client_env*
    - *react_app_admin_client_env*
    - *api_env*
  * Create dev/prod web server config at `src/nginx/nginx.conf`
  * The respective docker containers will use Hosts and Build settings as specified in this file.
  * Edit current project constants/settings at `src/setup_project.ts`
5. Ci Cd setup:
  * Create following secrets in your gh repo:
    - AWS_SSH_KEY (*and correspondingly change host at `.github/deploy.yml`*)
    - DOCKER_PASSWORD (*if you want to push/pull from a new registry*)
    - DOCKER_USERNAME (*if you want to push/pull from a new registry*)
  * There are 2 pre-commit hooks which can be ignored if necessary while commiting by using `--no-verify` tag:
    - linting check using husky
    - automatic docs generation into `docs/`

### TODO
- use pm2/else (production script), remove dev_local/dev_server
- global ts declaration file


## Client Repo <a name="client"></a>
[![Netlify Status](https://api.netlify.com/api/v1/badges/ec919ae6-f1a0-4d59-a0b9-796beec493ea/deploy-status)](https://app.netlify.com/sites/bits-vaccine-portal/deploys)

This app was made with <3 by students from BITS Pilani, using **React.js** for the frontend and **Node.js** for the backend. It uses the **Chakra-UI library, Google O-Auth,** and **Docker+Nginx** for hosting.

In case you'd like to run this on your local machine, follow these steps:

**Clone the repository**

```
git clone https://github.com/psrth/bits-vaccination-portal.git
```

**Build the clients**

```
cd vaccine-portal
npm install
npm start
```

```
cd vaccine-admin-portal
npm install
npm start
```

In case you'd like to contribute or squash a bug, just open a pull request!

## Run/Build <a name="run"></a>
1. Setup docker and docker-compose: 
  * This requires your machine to have Docker runtime installed.
    - [Mac OS](https://docs.docker.com/docker-for-mac/install/), [Windows](https://docs.docker.com/docker-for-windows/install/), [Linux](https://docs.docker.com/engine/install/) (Browse by distributions)
  * Further Install docker compose https://docs.docker.com/compose/install/
  * Create a docker user group to not require running as sudo
2. Build containers:
  - Either build or pull containers: `docker-compose build` or `docker-compose pull`
  - Run as: `docker-compose up -d`, preferrably install [lazydocker](https://github.com/jesseduffield/lazydocker) for quick logs view
  - Else, access [pino logs](https://getpino.io/#/) at `src/middeware/error_logs`
3. Regular Tasks:
  * Edit `src/middeware/logger.ts` and configure pino logger.
  * Customize `src/backup_script.sh` and create a [crontab](https://man7.org/linux/man-pages/man5/crontab.5.html) to run it every few hours.
  * Also create complimentory repository for versioning database backups, edit it in the backup script.


## Developers <a name="devs"></a>

**Parth Sharma** (Frontend Developer)  
**Mohit Makwana** (Backend Developer)

**Nidheesh Jain** (Frontend Mentor)  
**Anshal Shukla** (Backend Mentor)  
**Darsh Mishra** (Backend Mentor)

## License <a name="lic"></a>

This code is the intellectual property of BITS Pilani and the developers listed above. In case you'd like to repurpose some of this code, please get in touch with one of the developers so that we can get you explicit permission to use the codebase.
