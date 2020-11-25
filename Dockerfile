FROM node:12-alpine

WORKDIR /usr/app
COPY package.json .
RUN npm install

EXPOSE 80
CMD [ "npm", "start" ]

COPY . .
