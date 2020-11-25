FROM node:12-alpine

WORKDIR /usr/src/app
COPY package.json .
RUN npm install

EXPOSE 80
CMD [ "npm", "start" ]

COPY . .
