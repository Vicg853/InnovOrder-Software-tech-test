import type { Response } from 'express'

import { Body, Controller, Post, Res } from '@nestjs/common'

import { LoginDTO } from './dto/login.dto'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
   constructor(
      private auth_svc: AuthService
   ) {}

   @Post('login')
   async login(@Body() login_params: LoginDTO, @Res() res: Response) {
      const user = await this.auth_svc.validate_user(login_params)

      if (user === null) return res
         .status(401)
         .json({ message: 'Invalid credentials' })

      const token = await this.auth_svc.authenticate(user)

      return res.status(200).json({ token })
   }
}
