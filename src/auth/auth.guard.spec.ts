import type { ExecutionContext } from '@nestjs/common'
import type { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface'

import { Test, TestingModule } from '@nestjs/testing'

import { AuthGuard } from './auth.guard'

const token_mock = 'token'
const full_token_mock = `Bearer ${token_mock}`

const authServiceMock = {
  check_token: jest.fn().mockImplementation(async (token: string) => {
    if (token === token_mock) return true
    else return false
  })
}

const switchContextMockType = {
	getRequest: jest.fn()
} 

describe('Auth guard test', () => {
  let guard: AuthGuard
	let contextMock: ExecutionContext
	let switchHttpMock: typeof switchContextMockType

  beforeEach(async () => {
		guard = new AuthGuard(authServiceMock as any)

		switchHttpMock = switchContextMockType
		contextMock = {
			switchToHttp: jest.fn().mockReturnValue(switchHttpMock)
		} as any as ExecutionContext
  })

  afterEach(() => {
		jest.clearAllMocks()
	})

  it('Should allow access (valid token)', async () => {
		const reqMock = {
			headers: {
				authorization: full_token_mock
			}
		}
		switchHttpMock.getRequest.mockImplementation(() => reqMock)

		const result = await guard.canActivate(contextMock as any)
		expect(result).toBe(true)
	})

	it('Should deny access (no token)', async () => {
		const reqMock = {
			headers: {}
		}
		switchHttpMock.getRequest.mockImplementation(() => reqMock)

		const result = await guard.canActivate(contextMock as any)
		expect(result).toBe(false)
	})

	describe('Should deny access (invalid token)', () => {
		it('Invalid token type', async () => {
			const reqMock = {
				headers: {
					authorization: 'invalid'
				}
			}
			switchHttpMock.getRequest.mockImplementation(() => reqMock)
	
			const result = await guard.canActivate(contextMock as any)
			expect(result).toBe(false)
		})

		it('Invalid token', async () => {
			const reqMock = {
				headers: {
					authorization: 'Bearer invalid'
				}
			}
			switchHttpMock.getRequest.mockImplementation(() => reqMock)
	
			const result = await guard.canActivate(contextMock as any)
			expect(result).toBe(false)
		})
	})
})