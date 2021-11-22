FROM node:alpine

WORKDIR /lib_app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

CMD ["npm", "run", "devstart"]
