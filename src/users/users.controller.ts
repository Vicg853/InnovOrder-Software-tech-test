import type { Request, Response } from 'express'
import type { Repository } from 'typeorm'

import { Body, Controller, Post, Put, Req, Res, UseGuards } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { UsersService } from './users.service'
import { AuthService } from '@auth/auth.service'

import { AuthGuard } from '@auth/auth.guard'

import { CreateUserDTO } from './dto/create-user.dto'
import { UpdateUsrDTO } from './dto/update-user.dto';
import { User } from './users.entity'

@Controller('users')
export class UsersController {
	constructor(
		@InjectRepository(User)
		private usr_repo: Repository<User>,
		private user_svc: UsersService,
		private auth_svc: AuthService
	) {}

  	@Post('user')
	async create(@Body() new_usr_params: CreateUserDTO, @Res() res: Response) {
		//* Vérification de l'existence du nom d'utilisateur
		const exists = await this.usr_repo.findOne({ 
			where: { usr_name: new_usr_params.user_name }
		})

		if (exists !== null) return res.status(409) 
			.json({ message: 'Username already exists' })
		

		//* Création de l'utilisateur
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

	@UseGuards(AuthGuard)
	@Put("user")
	async update(@Body() update_usr_params: UpdateUsrDTO, @Req() req: Request, @Res() res: Response) {
		const user_id = this.auth_svc.get_token_in_req(req).payload.sub as string
		
		if(update_usr_params.new_password !== undefined) {
			const old_pass_check = await this.user_svc
				.pass_check(update_usr_params, user_id)

			if(old_pass_check === 'notfound') return res.status(404).json({
				message: "User with provided credentials couldn't be found"
			})
			else if(old_pass_check === 'typeorm_err') return res.status(500).json({
				message: "An issue ocurred while updating user."
			})
			else if(!old_pass_check) return res.status(403).json({
				message: "Invalid credentials"
			})
		}

		const update_res = await this.user_svc.update(update_usr_params, user_id)

		if(update_res === 'typeorm_err' || !update_res) return res.status(304).json({
			message: "An issue ocurred while updating user."
		})
		
		return res.status(200).json({
			message: "User with provided credentials couldn't be found"
		})
	}
}
