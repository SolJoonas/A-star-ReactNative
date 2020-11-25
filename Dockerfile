FROM node:12-alpine

WORKDIR /usr/app
COPY package.json .
RUN npm install

EXPOSE 80

CMD [ "npm", "i", "-g", "expo-cli" ]
CMD [ "yarn", "add", "react-native-web@~0.11", "react-dom" ]
CMD [ "expo", "start", "--web" ]

COPY . .
