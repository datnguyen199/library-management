FROM node:alpine

WORKDIR /lib_app

COPY . .

RUN npm install

CMD ["npm", "run", "devstart"]
