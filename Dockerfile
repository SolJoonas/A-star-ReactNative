FROM node:12-alpine

WORKDIR /usr/app
COPY package.json .
RUN npm install

EXPOSE 80
CMD [ "npm", "i", "-g", "expo-cli" ]
CMD [ "expo", "start", "--web" ]

COPY . .
