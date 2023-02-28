import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'

import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { AuthService } from '@auth/auth.service'

import { User } from './users.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, AuthService, JwtService],
  controllers: [UsersController],
  exports: [TypeOrmModule]
})
export class UsersModule {}
