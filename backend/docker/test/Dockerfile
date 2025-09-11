FROM node:22.15.1-alpine AS builder

WORKDIR /usr/src/app

COPY ./app/package.json ./app/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY ./app/ ./
RUN yarn build

FROM node:22.15.1-alpine AS runner

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY ./app/package.json ./

CMD ["node", "dist/src/main.js"]