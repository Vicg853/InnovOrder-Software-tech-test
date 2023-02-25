import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { AppController } from './app.controller'

import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'

import { User } from './users/users.entity'

const CONFIG_MOD = ConfigModule.forRoot({
  isGlobal: true,
})

//* Définition du module de connexion à Postgres
//* avec TypeORM
const DB_MOD = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
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

@Module({
  imports: [CONFIG_MOD, DB_MOD, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
