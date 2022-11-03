#!/bin/bash

# install Node.js dependency
npm install

# for websocket
npm install -s @nestjs/websockets @nestjs/platform-socket.io @types/socket.io

# for serving static assets
npm install --save hbs

# serve on localhost:3000
npm run start
