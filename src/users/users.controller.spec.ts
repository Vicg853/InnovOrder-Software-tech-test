import type { CreateUserDTO } from './dto/create-user.dto'
import type { Repository } from 'typeorm'

import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm'

import { User } from './users.entity'
import { UsersController } from './users.controller'

const typeORMUsrRepoMock = {
	findOne: jest.fn(),
	create: jest.fn(),
	save: jest.fn()
}

describe('UsersController', () => {
  	let controller: UsersController;
	let userRepo: Repository<User>;
	let expressRes: any;

  	beforeEach(async () => {
    	const module: TestingModule = await Test.createTestingModule({
			providers: [
				{ provide: getRepositoryToken(User), useValue: typeORMUsrRepoMock }
			],
      	controllers: [UsersController]
    	}).compile()

    	controller = module.get<UsersController>(UsersController)
		userRepo = module.get<Repository<User>>(getRepositoryToken(User));
		
		expressRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis()
		}
  	})

	afterEach(() => {
		jest.clearAllMocks()
	})

  	it('should be defined', () => {
   	expect(controller).toBeDefined()
  	})

	it('User creation', async () => {
		const mockUserReq = {
			password: 'password',
			user_name: 'username'
		} as CreateUserDTO

		const result = {
			usr_name: 'username',
			pass: 'password',
			id: 1
		} as User

		jest.spyOn(userRepo, 'findOne').mockImplementation(async () => null)
		jest.spyOn(userRepo, 'create').mockImplementation(() => result)
		jest.spyOn(userRepo, 'save').mockImplementation(async () => result)

		await controller.create(mockUserReq, expressRes)

		expect(userRepo.findOne).toBeCalledWith({ where: { usr_name: mockUserReq.user_name } })
		expect(userRepo.create).toBeCalledWith({ usr_name: mockUserReq.user_name, pass: mockUserReq.password })
		expect(userRepo.save).toBeCalledWith(result)
		expect(expressRes.status).toBeCalledWith(201)
	})

	it('Duplicated user creation', async () => {
		const mockUserReq = {
			password: 'password',
			user_name: 'username'
		} as CreateUserDTO

		const result = {
			usr_name: 'username',
			pass: 'password',
			id: 1
		} as User

		jest.spyOn(userRepo, 'findOne').mockImplementation(async () => result)
		jest.spyOn(userRepo, 'create').mockImplementation(() => result)
		jest.spyOn(userRepo, 'save').mockImplementation(async () => result)

		await controller.create(mockUserReq, expressRes)

		expect(userRepo.findOne).toBeCalledWith({ where: { usr_name: mockUserReq.user_name } })
		expect(userRepo.save).not.toBeCalled()
		expect(expressRes.status).toBeCalledWith(409)
	})
})
