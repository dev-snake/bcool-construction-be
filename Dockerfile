ARG NODE_VERSION=22.22.1

FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

ENV NODE_ENV=production

EXPOSE 8998

CMD ["yarn", "start:prod"]