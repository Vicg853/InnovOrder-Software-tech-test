import type { ProductAPIResponse, ProductNotFoundAPI } from '@products/product.dto'

import { catchError, firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'

import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'

import { ProductDTO } from '@products/product.dto'

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/'
const OPEN_FOOD_FACTS_API_PRODUCT_URL = `${OPEN_FOOD_FACTS_API}api/v0/product/`

type ProductVariants = ProductAPIResponse | ProductNotFoundAPI 
type APIRes = { 
   data: ProductVariants
   status: number
}

@Injectable()
export class AppService {
   constructor(
      private http_svc: HttpService
   ) {}

   async fetch_product(barcode: string): Promise<ProductDTO | null> {
      const url = `${OPEN_FOOD_FACTS_API_PRODUCT_URL}${barcode}.json`

      console.log(url)
      //* Query l'API Open Food Facts
      const response: APIRes = await firstValueFrom(
         this.http_svc.get<ProductAPIResponse>(url).pipe(
            catchError((err: AxiosError) => {
               console.log(JSON.stringify(err))
               console.log('BBB')
               throw err.status || 500
            })
         )
      ) as APIRes
      
      //* Double verification du status de la requête
      //* et capture des données (en cas de succès)
      if(response.status !== 200) throw response.status
      const product_variant = response.data as ProductVariants

      //* Handle le cas où le produit n'est pas trouvé
      //* sinon traitements des données du produit
      if(product_variant.status === 0) return null
      
      const product = product_variant as ProductAPIResponse
      return {
         barcode: product.code,
         name: product.product.product_name,
         country: product.product.countries,
         brand: product.product.brands,
         image_url: product.product.image_url
      } as ProductDTO
   }


}