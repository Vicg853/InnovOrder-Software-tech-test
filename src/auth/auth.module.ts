import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService, ConfigModule } from '@nestjs/config'

import { AuthController } from './auth.controller'

import { AuthService } from './auth.service'

import { UsersModule } from '@users/users.module'

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({  
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}
