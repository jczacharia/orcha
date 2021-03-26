import { User } from '@orcha-todo-example-app/shared/domain';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { TodoEntity } from '../todo/todo.entity';

@Entity()
export class UserEntity implements Required<User> {
  @PrimaryColumn('text')
  id!: string;

  @Column()
  password!: string;

  @Column()
  dateCreated!: Date;

  @Column({ nullable: true })
  dateLastLoggedIn!: Date;

  @OneToMany(() => TodoEntity, (e) => e.user)
  todos!: TodoEntity[];
}
