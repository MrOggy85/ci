FROM node:10.15

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

RUN npm run build

EXPOSE 5050

CMD [ "node", "./dist/app" ]
