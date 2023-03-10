import { IsNotEmpty, IsStrongPassword, ValidateIf  } from 'class-validator'

//* DTO pour la mise a jour d'un utilisateur,
//* avec validation des données (non vide et qualité du mot de passe)
export class UpdateUsrDTO {
   @ValidateIf(curr => curr.new_password === undefined)
   @IsNotEmpty({
      message: "You must provide either a new password or a new username (or both)",
   })
   new_user_name?: string;
   
   @ValidateIf(curr => curr.new_password !== undefined)
   @IsStrongPassword({
      minLowercase: 2,
      minUppercase: 2,
      minNumbers: 2,
      minSymbols: 1,
      minLength: 7,
   })
   new_password?: string

   @ValidateIf(curr => curr.new_password !== undefined)
   @IsNotEmpty({
      message: "You must provide your old_password when changing passwords"
   })
   old_password?: string
}