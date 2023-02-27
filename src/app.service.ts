import type { ProductAPIResponse, ProductNotFoundAPI } from '@products/product.dto'

import { catchError, firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'

import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'

import { ProductDTO } from '@products/product.dto'

export const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/'
export const OPEN_FOOD_FACTS_API_PRODUCT_URL = `${OPEN_FOOD_FACTS_API}api/v0/product/`

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

   async fetch_product(barcode: string): Promise<ProductDTO | null | number> {
      const url = `${OPEN_FOOD_FACTS_API_PRODUCT_URL}${barcode}.json`

      try {
         const response = await this.http_svc.axiosRef.get(url) as APIRes

         //* Double verification du status de la requête
         //* et capture des données (en cas de succès)
         if(response.status !== 200) return response.status || 500
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

      } catch (error) {
         return error.status || 500
      }
   }


}