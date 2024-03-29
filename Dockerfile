FROM node:16-alpine3.16 as development

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

RUN npx prisma generate

RUN yarn build

# @TODO: should not seed in production
RUN if [[ "$NODE_ENV" == "test" ]] ; then yarn run prisma:test:deploy; else yarn run prisma:migrate && sleep 1 && yarn db:dev:seed ; fi

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