
import { Test, TestingModule } from '@nestjs/testing'
import { HttpService } from '@nestjs/axios'

import { AppService, OPEN_FOOD_FACTS_API_PRODUCT_URL } from './app.service'

const valid_product_bar_mock = '1'
const invalid_product_bar_mock = '2'
const valid_product_url_mock = `${OPEN_FOOD_FACTS_API_PRODUCT_URL}${valid_product_bar_mock}.json`
const invalid_product_url_mock = `${OPEN_FOOD_FACTS_API_PRODUCT_URL}${invalid_product_bar_mock}.json`
const product_mock = {
  product_name: 'Test product',
  countries: 'Test country',
  brands: 'Test brand',
  image_url: 'Test image url'
}

const httpServiceMock = {
  axiosRef: {
    get: (url) => {
      if (url === valid_product_url_mock) {
        return {
          status: 200,
          data: {
            status: 1,
            code: valid_product_bar_mock,
            product: product_mock
          }
        }
      }
      else if (url === invalid_product_url_mock) {
        return {
          status: 200,
          data: {
            status: 0
          }
        }
      }
      else {
        throw {
          status: 500
        }
      }
    }
  }
}

describe('AppController', () => {
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AppService, 
        {
          provide: HttpService,
          useValue: httpServiceMock
        }
      ],
    }).compile()

    appService = app.get<AppService>(AppService)
  })

  it('Root is defined', () => {
    expect(appService).toBeDefined();
  })

  describe('Product fetching service', () => {
    it('Should return a product', async () => {
      const product = await appService.fetch_product(valid_product_bar_mock)
      
      expect(product).toEqual({
        barcode: valid_product_bar_mock,
        name: product_mock.product_name,
        country: product_mock.countries,
        brand: product_mock.brands,
        image_url: product_mock.image_url
      })
    })
    
    it('Should not find product', async () => {
      const product = await appService.fetch_product(invalid_product_bar_mock)

      expect(product).toBeNull()
    })

    it('Should return an error', async () => {
      const product = await appService.fetch_product('')

      expect(product).toBe(500)
    })
  })
})
