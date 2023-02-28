import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { AuthService } from '@auth/auth.service'

import { User } from './users.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersService, AuthService],
  controllers: [UsersController],
  exports: [TypeOrmModule]
})
export class UsersModule {}
