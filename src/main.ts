import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  //* Initialization du pipe de validation de input 
  //* (e.g. DTO validation des champs de création d'utilisateur, etc.)
  app.useGlobalPipes(new ValidationPipe({
    disableErrorMessages: process.env.NODE_ENV === 'production'
  }))

  await app.listen(3000)
}
bootstrap();
