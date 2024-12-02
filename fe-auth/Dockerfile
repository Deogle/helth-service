FROM node:18 AS build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM node:18-alpine AS deploy-node
WORKDIR /app
RUN rm -rf ./*
COPY --from=build /app/package.json .
COPY --from=build /app/package-lock.json .
COPY --from=build /app/build .

RUN apk --no-cache add curl

RUN npm ci --omit=dev
CMD ["node", "-r", "dotenv/config", "index.js"]
