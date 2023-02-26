import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'

import { AppController } from './app.controller'

import { AppService } from './app.service'
import { AuthService } from './auth/auth.service'

import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'

import { User } from './users/users.entity'

const CONFIG_MOD = ConfigModule.forRoot({
  isGlobal: true,
})

//* Définition du module de connexion à Postgres
//* avec TypeORM
const DB_MOD = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: parseInt(configService.get('DB_PORT'), 10),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASS'),
    database: configService.get('DB_NAME'),
    entities: [User],
    synchronize: true,
  }),
})

const HTTP_MOD = HttpModule.register({
  timeout: 5000,
  maxRedirects: 0,
})

@Module({
  imports: [CONFIG_MOD, DB_MOD, HTTP_MOD, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}
