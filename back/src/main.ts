import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import * as cookieParser from 'cookie-parser';
import express, { Request, Response } from "express";
import {Req, Res} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [,
      `http://${process.env.IP_ADDR}:3001`,
      `http://${process.env.IP_ADDR}:3000`,
      `http://${process.env.IP_ADDR}`,
    ],
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(3001);
}
bootstrap();
