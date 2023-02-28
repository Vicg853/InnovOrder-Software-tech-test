import type { Repository } from 'typeorm'

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import type { UpdateUsrDTO } from './dto/update-user.dto'
import { User } from '../users/users.entity'

@Injectable()
export class UsersService {
   constructor(
      @InjectRepository(User)
      private usr_repo: Repository<User>
   ) {}

   //* Fonction de verification de mot de passe 
   //* (utilisée pour des mises à jour de compte)
   async pass_check(update_params: UpdateUsrDTO, user_id: string): Promise<boolean | 'notfound' | 'typeorm_err'> {
      try {
         const user = await this.usr_repo.findOne({
            where: { id: parseInt(user_id, 10) }
         })
         
         if(user === null) return 'notfound'
         
         return user.check_pass(update_params.old_password)
      } catch(_) {
         return 'typeorm_err'
      }

   }

   //* Fonction de mise à jour de compte
   async update(update_params: UpdateUsrDTO, user_id: string): Promise<boolean | 'typeorm_err'> {
      try {
         //* La méthode update() n'est pas utilisée
         //* car celle-ci ne declanche pas le BeforeUpdate()
         //* qui permet de hasher le mot de passe
         const user = await this.usr_repo.findOne({
            where: { id: parseInt(user_id, 10) }
         })

         if(user === null) return false

         //* Mise à jour des paramètres reçus
         if(update_params.new_password !== undefined) 
            user.pass = update_params.new_password;
         if(update_params.new_user_name !== undefined) 
            user.usr_name = update_params.new_user_name;

         await this.usr_repo.save(user)
         
         return true
      } catch(_) {
         return 'typeorm_err'
      }
   }
}
