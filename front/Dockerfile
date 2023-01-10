# FROM node:lts-alpine

# WORKDIR /app

# COPY ./package*.json .

# RUN npm install

FROM node:14.17.1-alpine

WORKDIR /app

RUN apk update && apk add bash
RUN apk add nginx
COPY . /app/
RUN yarn install
RUN yarn build
RUN yarn global add serve
# CMD serve -s build
# ENTRYPOINT [ "executable" ]
# COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# RUN mkdir /usr/share/nginx
# RUN cp -r ./build /usr/share/nginx/html
# EXPOSE 8080