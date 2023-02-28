import type { Repository } from 'typeorm'
import type { JwtHeader, JwtPayload, Jwt } from 'jsonwebtoken'

import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'

import type { LoginDTO } from './dto/login.dto'

import { User } from '../users/users.entity'
import { Request } from 'express'



@Injectable()
export class AuthService {
   constructor(
      @InjectRepository(User)
      private usr_repo: Repository<User>,
      private readonly jwt_svc: JwtService,
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
         iss: this.config_svc.get('JWT_ISSUER')
      }

      return await this.jwt_svc.signAsync(payload, {
         header,
         expiresIn: this.config_svc.get('JWT_EXPIRE_TIME'),
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
         return false
      }
   }

   decode_token(token: string): Jwt | null {
      try {
         return this.jwt_svc.decode(token, {
            complete: true
         }) as Jwt
      } catch(e) {
         return null
      }
   }

   get_token_in_req(req: Request): Jwt | null {
      const token_rgx = /^Bearer\ /
      const token_raw = req.headers.authorization
      
      if(!token_raw) return null

      if(!token_rgx.test(token_raw)) return null
      const token = token_raw.replace(token_rgx, '').toString()

      return this.decode_token(token)
   }
}
