import { getRepositoryToken } from '@nestjs/typeorm'
import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

import type { Repository } from 'typeorm'

import { User } from '../users/users.entity'
import { AuthService } from './auth.service'

const typeORMUsrRepoMock = {
	findOne: jest.fn(),
}

const jwtServiceMock = {
	sign: jest.fn(),
  verify: jest.fn()
}

const configServiceMock = {
	get: jest.fn((key: string) => {
    switch (key) {
      case 'JWT_ISSUER': return 'test'
      case 'JWT_EXPIRE_TIME': return '172800'
      case 'JWT_ALGO': return 'HS256'
      case 'JWT_SECRET': return 'secret'
    }
  })
}

describe('AuthController', () => {
  let service: AuthService
	let userRepo: Repository<User>
  let user_mock: User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
		  providers: [
		  	{ provide: getRepositoryToken(User), useValue: typeORMUsrRepoMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        AuthService
		  ],
    }).compile()

    service = module.get<AuthService>(AuthService)
		userRepo = module.get<Repository<User>>(getRepositoryToken(User))
    user_mock = {
      id: 1,
      usr_name: 'Bob',
      pass: 'hashed1234',
      check_pass: jest.fn(),
      hash_pass: jest.fn()
    }
  })

  afterEach(() => {
		jest.clearAllMocks()
	})

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe("User validation", () => {
    it("Validates user", async () => {
      jest.spyOn(userRepo, 'findOne').mockImplementation(async () => user_mock)
      jest.spyOn(user_mock, 'check_pass').mockImplementation(async () => true)

      const service_res = await service.validate_user({
        user_name: user_mock.usr_name,
        password: user_mock.pass
      })

      expect(userRepo.findOne).toBeCalledWith({
        where: { usr_name: user_mock.usr_name }
      })
      expect(user_mock.check_pass).toBeCalledWith(user_mock.pass)
      expect(service_res.id).toEqual(user_mock.id)
    })
    
    it("Does not accept invalid user", async () => {
      jest.spyOn(userRepo, 'findOne').mockImplementation(async () => null)
      jest.spyOn(user_mock, 'check_pass')

      const service_res = await service.validate_user({
        user_name: user_mock.usr_name,
        password: user_mock.pass
      })

      expect(userRepo.findOne).toBeCalledWith({
        where: { usr_name: user_mock.usr_name }
      })
      expect(user_mock.check_pass).not.toBeCalled()
      expect(service_res).toEqual(null)
    })

    it("Does not accept invalid password", async () => {
      jest.spyOn(userRepo, 'findOne').mockImplementation(async () => user_mock)
      jest.spyOn(user_mock, 'check_pass').mockImplementation(async () => false)

      const service_res = await service.validate_user({
        user_name: user_mock.usr_name,
        password: user_mock.pass
      })

      expect(userRepo.findOne).toBeCalledWith({
        where: { usr_name: user_mock.usr_name }
      })
      expect(user_mock.check_pass).toBeCalledWith(user_mock.pass)
      expect(service_res).toEqual(null)
    })
  }) 
});
