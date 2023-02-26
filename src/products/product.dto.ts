export interface ProductAPIResponse {
   code: string
   status: 1,
   product: {
      countries: string
      brands: string
      product_name: string
      image_url: string
   }
}

export interface ProductNotFoundAPI {
   status: 0,
   status_verbose: 'product not found'
   code: string
}

export class ProductDTO {
   barcode: ProductAPIResponse['code']
   name: ProductAPIResponse['product']['product_name']
   country: ProductAPIResponse['product']['countries']
   brand: ProductAPIResponse['product']['brands']
   image_url: ProductAPIResponse['product']['image_url']
}
