FROM node:16

ENV PORT 8086
EXPOSE 8086

RUN apt install -y curl
RUN curl -fsSL https://get.docker.com | sh;
RUN apt install -y git
RUN apt install -y p7zip-full

COPY ./package.json .
COPY ./yarn.lock .
RUN yarn install
RUN mkdir /tmp/aptero/

COPY ./tsconfig.json ./tsconfig.json
COPY ./src ./src
RUN yarn run build
#RUN npm run test

CMD ["node", "dist/"]
