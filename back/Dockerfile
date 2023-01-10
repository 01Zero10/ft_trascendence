# FROM node:12

# # In our container
# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build

# EXPOSE 3001

# CMD ["node", "dist/main"]

FROM node:14.17.1-alpine

WORKDIR /app
COPY . /app/

RUN apk update && apk add bash
RUN apk --no-cache add --virtual builds-deps build-base python
RUN yarn install
RUN yarn build

EXPOSE 3001