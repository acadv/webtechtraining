import { configure as serverlessExpress } from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Callback, Context, Handler } from 'aws-lambda';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

let cachedServer: Handler;

export const handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (!cachedServer) {
    const nestApp = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
      .setTitle('Web Tech Training')
      .setDescription('Web Tech Training API')
      .setVersion('0.1')
      .build();

    const document = SwaggerModule.createDocument(nestApp, config);
    SwaggerModule.setup('api', nestApp, document);
    await nestApp.init();
    cachedServer = serverlessExpress({
      app: nestApp.getHttpAdapter().getInstance(),
    });
  }

  return cachedServer(event, context, callback);
};
