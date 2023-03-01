import type { RedisClientOptions } from 'redis'

import * as redisStore from 'cache-manager-redis-store'

import { Module, CacheModule } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'

import { AppController } from './app.controller'

import { AppService } from './app.service'
import { AuthService } from './auth/auth.service'
import { OpenFoodCacheInterceptor } from './op_fo-caching/caching.interceptor'

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

const CACHE_MANAGER = CacheModule.registerAsync<RedisClientOptions>({
  inject: [ConfigService],
  isGlobal: true,
  useFactory: (configService: ConfigService) => ({
    ttl: parseInt(configService.get('CACHE_TTL'), 10),
    max: parseInt(configService.get('CACHE_MAX'), 10),
    store: redisStore as any,
    url: (function () {
      const usr = configService.get('CACHE_USER')
      const pass = configService.get('CACHE_PASS')
      const host = configService.get('CACHE_HOST')
      const port = configService.get('CACHE_PORT')
      const db = configService.get('CACHE_DB_NUM')

      return `redis://${usr || pass ? `${usr}:${pass}@` : ''}${host}:${port}/${db}`
    })()
  }),
})


@Module({
  imports: [CONFIG_MOD, DB_MOD, HTTP_MOD, CACHE_MANAGER, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}
