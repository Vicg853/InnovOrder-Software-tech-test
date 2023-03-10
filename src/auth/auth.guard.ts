import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'

import { AuthService } from './auth.service'
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
   constructor(
      private auth_svc: AuthService
   ) { }

   async canActivate(
      context: ExecutionContext
   ): Promise<boolean> {
      const req = context.switchToHttp().getRequest<Request>()

      const token_rgx = /^Bearer\ /;
      const token_raw = req.headers.authorization;
      
      if(!token_raw) return false

      if(!token_rgx.test(token_raw)) return false
      const token = token_raw.replace(token_rgx, '').toString()

      const token_check = await this.auth_svc.check_token(token)
      return token_check
   }
}