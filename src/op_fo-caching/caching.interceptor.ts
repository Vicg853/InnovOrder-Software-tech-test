import type { Request } from 'express'
import type { FetchProductResponse } from '@src/app.controller'

import { ProductDTO } from '@products/product.dto'

import { Cache } from 'cache-manager'

import { Observable, of, tap } from 'rxjs'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, CACHE_MANAGER, Inject } from '@nestjs/common'


@Injectable()
export class OpenFoodCacheInterceptor implements NestInterceptor {
   constructor(
      @Inject(CACHE_MANAGER) 
      private cache_manager: Cache
   ) {}

   async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<FetchProductResponse>> {
      //* Extraction du code de bar produit de l'URL
      const req = context.switchToHttp().getRequest<Request>()

      const product_code_raw = new String(req.url)
         .split('/').pop()
      if(product_code_raw === undefined) return next.handle()

      const product_code = product_code_raw.split('.').shift()
      if(product_code === undefined) return next.handle()
      
      //* Vérification de la présence du produit en cache
      const cache_result = await this.cache_manager.get<ProductDTO | null>(product_code)

      //* Retour du produit en cache ou suite de la requête
      //* et mise en cache du résultat
      if(cache_result === null) return next.handle()
         .pipe(tap(async (product) => {
            try {
               const parsed_product = JSON.stringify(product)
               await this.cache_manager.set(product_code, parsed_product)
            } catch (error) {
               console.error(`Error while caching product ${product_code}: ${error}`)
            }
         }))
      else {
         try {
            console.log(`Product ${cache_result} found in cache`)
            const parsed_product = JSON.parse(cache_result)

            return of({
               message: 'Product found (cached)',
               product: parsed_product
            })
         } catch (error) {
            console.error(`Error while parsing cached product ${product_code}: ${error}`)
            return next.handle()
         }
      }
         
   }
}