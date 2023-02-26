import type { Repository } from 'typeorm'
import type { JwtHeader, JwtPayload } from 'jsonwebtoken'

import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'

import type { LoginDTO } from './dto/login.dto'

import { User } from '../users/users.entity'

@Injectable()
export class AuthService {
   constructor(
      @InjectRepository(User)
      private usr_repo: Repository<User>,
      private jwt_svc: JwtService,
      private config_svc: ConfigService
   ) {}

   async validate_user(login_params: LoginDTO) {
      const user = await this.usr_repo.findOne({
         where: { usr_name: login_params.user_name }
      })

      if (user === null) return null

      const valid_pass = await user.check_pass(login_params.password)

      if (!valid_pass) return null
      else return user
   }

   private async gen_token(user_id: User['id']): Promise<string> {
      const header: JwtHeader = {
         alg: this.config_svc.get('JWT_ALGO'),
      }
      
      const payload: JwtPayload = {
         sub: user_id.toString(),
         exp: parseInt(this.config_svc.get('JWT_EXPIRE_TIME')),
         iss: this.config_svc.get('JWT_ISSUER')
      }

      return await this.jwt_svc.signAsync(payload, {
         header,
         algorithm: this.config_svc.get('JWT_ALGO')
      })
   }

   async authenticate(user: User): Promise<string> {
      const token = await this.gen_token(user.id)

      return token
   }

   async check_token(token: string): Promise<boolean> {
      try {
         await this.jwt_svc.verifyAsync(token, {
            algorithms: this.config_svc.get('JWT_ALGO'),
            issuer: this.config_svc.get('JWT_ISSUER'),
            secret: this.config_svc.get('JWT_SECRET')
         })

         return true
      } catch(err) {
         console.log(err)
         return false
      }
   }
}
