# syntax=docker.io/docker/dockerfile:1
  
FROM node:22.15.1-alpine

WORKDIR /app

COPY ./app/package.json ./app/yarn.lock ./docker/test/files/.env ./

RUN yarn install --frozen-lockfile

COPY ./app/ ./

CMD ["sh", "-c", "yarn build"]
