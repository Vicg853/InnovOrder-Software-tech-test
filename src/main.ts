import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)

  //* Initialization du pipe de validation de input 
  //* (e.g. DTO validation des champs de création d'utilisateur, etc.)
  app.useGlobalPipes(new ValidationPipe({
    disableErrorMessages: process.env.NODE_ENV === 'production',
    whitelist: true,
  }))

  await app.listen(config.get('PORT'))
}
bootstrap();
