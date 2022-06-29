FROM node:16-alpine

ENV PORT 8086
EXPOSE 8086

RUN curl -fsSL https://get.docker.com | sh;
RUN apk add --update --no-cache git
RUN apk add --update --no-cache p7zip

COPY ./package.json .
COPY ./yarn.lock .
RUN yarn install

COPY ./src ./src
COPY ./tsconfig.json ./tsconfig.json
RUN yarn run build

#RUN npm run test

CMD ["node", "dist/"]
