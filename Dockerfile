FROM node:20.10-bullseye-slim as base

RUN apt-get update && apt-get install -y \
    bash \
    net-tools \ 
    curl

WORKDIR /app

RUN npm install -g --arch=x64 --platform=linux --libc=glibc sharp@0.33.0-rc.2
RUN npm install --force @img/sharp-linux-x64
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

ARG PORT
EXPOSE 5002
EXPOSE $PORT
CMD ["yarn", "start"]
