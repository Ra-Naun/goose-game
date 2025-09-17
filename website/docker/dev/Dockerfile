# syntax=docker.io/docker/dockerfile:1
  
FROM node:22.15.1-alpine

RUN apk add --update \
  python3 \
  build-base \
  gcc

WORKDIR /app

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=20 \
  CMD node ./healthcheck.js

CMD ["sh", "-c", "cat ./env/secret.env ./env/local.env > ./.env && yarn install && yarn run dev"]