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

   async update(update_params: UpdateUsrDTO, user_id: string): Promise<boolean | 'typeorm_err'> {
      try {
         const update = await this.usr_repo.update({
            id: parseInt(user_id, 10)
         }, {
            pass: update_params.new_password,
            usr_name: update_params.new_user_name
         })

         if(update.generatedMaps.length) return false
         return true
      } catch(_) {
         return 'typeorm_err'
      }
   }
}
