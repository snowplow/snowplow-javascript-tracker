FROM node:8.12.0-alpine

RUN apk add git
RUN npm install -g grunt-cli 

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY . .
