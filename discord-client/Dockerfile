FROM node:18 as build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY . ./
RUN npm ci
RUN npm run build

FROM node:18-alpine as deploy
COPY --from=build /app/package.json .
COPY --from=build /app/package-lock.json .
COPY --from=build /app/build .
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["node","index.js"]