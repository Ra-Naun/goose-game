# syntax=docker.io/docker/dockerfile:1
  
FROM node:22.15.1-alpine

RUN apk add --update \
  python3 \
  build-base \
  gcc

WORKDIR /usr/src/app



CMD ["sh", "-c", "yarn install &&\
  yarn prisma db push &&\
  yarn prisma generate &&\
  yarn prisma:seed"]
