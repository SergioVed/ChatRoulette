import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import {WsAdapter} from "@nestjs/platform-ws";


async function start() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app))

  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
  )

    app.enableCors({
        origin: ['http://localhost:5173', 'https://colours-bid-jesse-mailto.trycloudflare.com'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    });

  await app.listen(process.env.PORT ?? 3000);
}
void start();
