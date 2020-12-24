import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'User' })
export class UserEntity {
  @PrimaryColumn('text')
  id!: string;

  @Column()
  password!: string;
}
