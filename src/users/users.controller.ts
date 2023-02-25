import type { Response } from 'express'
import type { Repository } from 'typeorm'
import type { CreateUserDTO } from './dto/create-user.dto'

import { Body, Controller, Post, Res } from '@nestjs/common'

import { InjectRepository } from '@nestjs/typeorm'

import { User } from './users.entity'

@Controller('users')
export class UsersController {
	constructor(
		@InjectRepository(User)
		private usr_repo: Repository<User>,
	) {}

  	@Post('user')
	async create(@Body() new_usr_params: CreateUserDTO, @Res() res: Response) {
		//* Etape 1: Vérification de l'existence du nom d'utilisateur
		const exists = await this.usr_repo.findOne({ 
			where: { usr_name: new_usr_params.user_name }
		})

		if (exists !== null) return res.status(409) 
			.json({ message: 'Username already exists' })
		

		//* Etape 2: Création de l'utilisateur
		const user_creation_query = this.usr_repo.create({
			usr_name: new_usr_params.user_name,
			pass: new_usr_params.password,
		})
		
		try {
			await this.usr_repo.save(user_creation_query)

			return res.status(201).json({ message: 'User created' })
		} catch (err) {
			return res.status(500).json({ message: 'There was an issue creating user' })
		}
	}
}
