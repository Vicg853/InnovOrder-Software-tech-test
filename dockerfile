FROM node:19.7-alpine3.17 AS build

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
COPY .dockerignore .
COPY . .

RUN npm run build

FROM node:19.7-alpine3.17 as run

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -p 

COPY --from=build /usr/src/app/dist ./

CMD ["node", "main"]