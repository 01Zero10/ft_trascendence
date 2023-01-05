# FROM node:12

# # In our container
# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build

# EXPOSE 3001

# CMD ["node", "dist/main"]

FROM node:latest

WORKDIR /app

RUN mkdir imgs

COPY ./package*.json .