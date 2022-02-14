FROM node:14.19.0

# ########################### Python and libs support for PyDIVOC Qr scanner ###########################
# install python support tools and pip
RUN apt-get update && \
    apt-get install -y \
        python3 \
        python3-pip \
        python3-setuptools \
        groff \
        less \
    && pip3 install --upgrade pip \
    && apt-get clean

# Libraries for running python shell in node childprocess
RUN apt-get update ##[edited]
RUN apt-get install ffmpeg libsm6 libxext6  -y

# File access via py in child process 
RUN apt-get update && apt-get install poppler-utils -y

# Libs for generating png from cert pdf
RUN apt-get update && apt-get install ghostscript graphicsmagick -y

# ########################### Source code in container ###########################
# setting working directory
WORKDIR /Portal

# source code dependancies
COPY ./package.json .
COPY ./tsconfig.json .

# Nodemon for automatic restart on failures for tests
RUN npm install -g nodemon

# ########################### / ########################### / ###########################
# Get latest npm version
RUN npm install -g npm@7.20.1

# install dependencies
RUN npm install 

# Copy source code
ADD src /Portal/src
# PyDIVOC dependencies
RUN apt update
RUN apt install python3-pip
RUN apt-get update && apt-get upgrade python-pip -y
RUN cd src/PyDIVOC && pip3 install -r requirements.txt && python3 setup.py build 

# ########################### / ########################### / ###########################

# Exposing running port for nginx
EXPOSE 3000

# ########################### NOTE : Migrated from 3rd party admin providers to custom admin ###########################
# Expose admin port 
# EXPOSE 3310
# ########################### / ########################### / ###########################

# RUN cd ../../
RUN npm install -g ts-node

# Dev environment
CMD ["npm", "run", "dev_server"]
