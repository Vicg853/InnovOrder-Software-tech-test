import { IsNotEmpty, IsStrongPassword  } from 'class-validator';

//* DTO pour la création d'un utilisateur,
//* avec validation des données (non vide et qualité du mot de passe)
export class CreateUserDTO {
   @IsNotEmpty()
   user_name: string;
   
   @IsNotEmpty()
   @IsStrongPassword({
      minLowercase: 2,
      minUppercase: 2,
      minNumbers: 2,
      minSymbols: 1,
      minLength: 7,
   })
   password: string;
}
