import type { DataSource } from 'typeorm'

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AppService } from './app.service'

import { AppController } from './app.controller'

import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'

import { User } from './users/users.entity'

//* Définition du module de connexion à Postgres
//* avec TypeORM
const DB_MOD = TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [User],
  synchronize: true,
})

@Module({
  imports: [UsersModule, AuthModule, DB_MOD],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
