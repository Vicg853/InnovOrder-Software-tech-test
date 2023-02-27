import { Response } from 'express'

import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common'

import { AppService } from './app.service'
import { AuthGuard } from '@auth/auth.guard'

@Controller()
export class AppController {
   constructor(
      private app_svc: AppService
   ) {}

   @UseGuards(AuthGuard)
   @Get('/product/:barcode')
   async query_product(@Param('barcode') barcode: string, @Res() res: Response) {
      const product = await this.app_svc.fetch_product(barcode)

      if(typeof product === 'number') return res.status(500).json({ 
         message: 'An error occured while querying the Open Food Facts API',
      })
      
      if (product === null) return res.status(404).json({ message: 'Product not found' })

      return res.status(200).json({
         message: 'Product found',
         product
      })
      
   }
}
