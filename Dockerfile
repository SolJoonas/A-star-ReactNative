FROM node:12-alpine

RUN mkdir -p /node
ADD . /node
WORKDIR /node
COPY package.json .
RUN npm install

EXPOSE 80

CMD [ "expo", "start", "--web" ]

COPY . .
