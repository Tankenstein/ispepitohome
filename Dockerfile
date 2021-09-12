FROM node:alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY updateServer.js ./
COPY src/. ./src/

CMD [ "node", "updateServer.js" ]