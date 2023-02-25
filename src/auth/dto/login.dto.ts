import { IsNotEmpty } from 'class-validator'

export class LoginDTO {
   @IsNotEmpty()
   user_name: string;
   
   @IsNotEmpty()
   password: string;
}
