import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Context, Handler } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';
import express from 'express';
import { AppModule } from './app.module';

let cachedHandler: Handler | undefined;

async function bootstrapServer(): Promise<Handler> {
  if (!cachedHandler) {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    nestApp.enableCors();
    nestApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    nestApp.setGlobalPrefix('api');

    await nestApp.init();
    cachedHandler = serverlessExpress({ app: expressApp });
  }
  return cachedHandler;
}

export const handler: Handler = async (event: any, context: Context) => {
  const serverlessHandler = await bootstrapServer();
  return new Promise((resolve, reject) => {
    serverlessHandler(event, context, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};
