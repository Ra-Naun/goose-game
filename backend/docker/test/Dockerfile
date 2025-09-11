# syntax=docker/dockerfile:1

FROM node:22.15.1-alpine AS builder

WORKDIR /usr/src/app

COPY ./app/package.json ./app/yarn.lock ./

RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6 yarn install --frozen-lockfile

COPY ./app/ ./

RUN yarn build

FROM node:22.15.1-alpine AS runner

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY ./app/package.json ./app/healthcheck.js ./


HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=20 \
  CMD node ./healthcheck.js

CMD ["yarn", "start:prod"]