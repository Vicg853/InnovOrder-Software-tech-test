import type { JwtPayload, JwtHeader } from 'jsonwebtoken'

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

const token_mock = 'token'
const jwtServiceMock = {
	signAsync: jest.fn(async () => token_mock),
  verifyAsync: jest.fn().mockImplementation(async (token: string) => {
    if (token === token_mock) return true
    else throw new Error()
  })
}

const configServiceMock = {
	get: jest.fn((key: string) => {
    switch (key) {
      case 'JWT_ISSUER': return 'test'
      case 'JWT_EXPIRE_TIME': return '2 days'
      case 'JWT_ALGO': return 'HS256'
      case 'JWT_SECRET': return 'secret'
    }
  })
}

describe('AuthController', () => {
  let service: AuthService
	let userRepo: Repository<User>
  let user_mock: User
  let jwt_mock: JwtService

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
    jwt_mock = module.get<JwtService>(JwtService)
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

  describe("JWT based authentication", () => {
    it("Authenticates user", async () => {
      jest.spyOn(jwt_mock, 'signAsync')
      const payload: JwtPayload = {
        sub: user_mock.id.toString(),
        iss: configServiceMock.get('JWT_ISSUER')
      }
      const header: JwtHeader = {
        alg: configServiceMock.get('JWT_ALGO'),
      }

      const auth_res = await service.authenticate(user_mock)

      expect(jwt_mock.signAsync).toBeCalledWith(payload, {
          header,
          expiresIn: configServiceMock.get('JWT_EXPIRE_TIME'),
          algorithm: configServiceMock.get('JWT_ALGO')
      })
      expect(auth_res).toEqual(token_mock)
    })

    it("Checks user's valid token authenticity", async () => {
      jest.spyOn(jwt_mock, 'verifyAsync')

      const check_res = await service.check_token(token_mock)

      expect(jwt_mock.verifyAsync).toBeCalledWith(token_mock, {
        issuer: configServiceMock.get('JWT_ISSUER'),
        algorithms: configServiceMock.get('JWT_ALGO'),
        secret: configServiceMock.get('JWT_SECRET')
      })
      expect(check_res).toBe(true)
    })

    it("Checks user's invalid token authenticity", async () => {
      jest.spyOn(jwt_mock, 'verifyAsync')

      const check_res = await service.check_token('invalid_token')

      expect(jwt_mock.verifyAsync).toBeCalledWith('invalid_token', {
        issuer: configServiceMock.get('JWT_ISSUER'),
        algorithms: configServiceMock.get('JWT_ALGO'),
        secret: configServiceMock.get('JWT_SECRET')
      })
      expect(check_res).toBe(false)
    })
  })
});
