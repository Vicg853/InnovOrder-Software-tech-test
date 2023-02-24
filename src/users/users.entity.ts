import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm'
import { hash, compare } from 'bcryptjs'

//* Définition de l'entité User
//* et du format de données attendu
//* sur la base de données
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false, unique: true })
  usr_name: string;

  @Column({ type: 'varchar', nullable: false })
  pass: string;

  //* Hashage du mot de passe avant insertion (création ou mise à jour)
  @BeforeInsert()
  @BeforeUpdate()
  async hash_pass(): Promise<void> {
    this.pass = await hash(this.pass, 10)
  }

  //* Vérification du mot de passe
  async check_pass(attempt: string): Promise<boolean> {
    return await compare(attempt, this.pass)
  }
}