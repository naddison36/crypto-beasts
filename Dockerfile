ARG NODE_VERSION=10.15.3

# First build is just the base image that helps work around no layer caching in CircleCi
# is pulled from the Heroku Container Registry so it's layers
FROM node:${NODE_VERSION}-stretch AS base
WORKDIR /scratch

# Following is used in the CI build
ADD https://github.com/LLK/scratch-vm/archive/develop.tar.gz /scratch/vm.tar.gz
RUN tar xfz vm.tar.gz 
ADD https://github.com/LLK/scratch-gui/archive/develop.tar.gz /scratch/gui.tar.gz
RUN tar xfz gui.tar.gz

# The following is used for faster local testing
# ADD scratch-vm-develop.tar.gz /scratch
# ADD scratch-gui-develop.tar.gz /scratch

RUN mv /scratch/scratch-vm-develop /scratch/vm
RUN mv /scratch/scratch-gui-develop /scratch/gui

COPY heroku/.env.* /scratch/gui/

WORKDIR /scratch/gui

RUN npm set progress=false && \
   npm config set depth 0 && \
   npm install && \
   npm cache clean --force

WORKDIR /scratch/vm

RUN npm set progress=false && \
   npm config set depth 0 && \
   npm install && \
   npm cache clean --force

RUN npm link

WORKDIR /scratch/gui

RUN npm link vm

COPY scratch/extensions /scratch/vm/src/extensions/custom

COPY scratch/gui/index.jsx /scratch/gui/src/lib/libraries/extensions/index.jsx
COPY scratch/vm/extension-manager.js /scratch/vm/src/extension-support/extension-manager.js

# Build the react app into the /scratch/gui/build folder
RUN npm run build

# Build the production image
FROM nginx:alpine AS web
COPY --from=base /scratch/gui/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
