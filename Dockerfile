ARG NODE_VERSION=10.15.3

# First build is just the base image that helps work around no layer caching in CircleCi
# is pulled from the Heroku Container Registry so it's layers
# FROM node:${NODE_VERSION}-stretch AS crypto-beasts-base
FROM node:${NODE_VERSION}-stretch AS crypto-beasts-web
WORKDIR /scratch

ADD https://github.com/LLK/scratch-vm/archive/develop.tar.gz /scratch/scratch-vm.tar.gz
RUN tar xfz scratch-vm.tar.gz && \
    mv /scratch/scratch-vm-develop /scratch/scratch-vm

ADD https://github.com/LLK/scratch-gui/archive/develop.tar.gz /scratch/scratch-gui.tar.gz
RUN tar xfz scratch-gui.tar.gz && \
    mv /scratch/scratch-gui-develop /scratch/scratch-gui

COPY heroku/.env.development /scratch

WORKDIR /scratch/scratch-gui

RUN npm set progress=false && \
   npm config set depth 0 && \
   npm install && \
   npm cache clean --force

WORKDIR /scratch/scratch-vm

RUN npm set progress=false && \
   npm config set depth 0 && \
   npm install && \
   npm cache clean --force

RUN npm link

WORKDIR /scratch/scratch-gui

RUN npm link scratch-vm

COPY scratch/extensions /scratch/scratch-vm/src/extensions/custom

COPY scratch/gui/index.jsx /scratch/scratch-gui/src/lib/libraries/extensions/index.jsx
COPY scratch/vm/extension-manager.js /scratch/scratch-vm/src/extension-support/extension-manager.js

# FROM node:${NODE_VERSION}-alpine AS crypto-beasts-web

# # copy the modules that have been cleaned of dev dependencies and tests
# COPY --from=crypto-beasts-base /scratch /scratch

# WORKDIR /scratch/scratch-gui

CMD ["npm", "start"]
