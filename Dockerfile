FROM node:16-alpine3.16 As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

RUN npx prisma generate

RUN yarn build

FROM node:16-alpine3.16 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install --production

COPY . .

RUN npx prisma generate

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/src/main"]