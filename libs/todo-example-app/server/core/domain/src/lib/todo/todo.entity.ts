import { Todo } from '@orcha-todo-example-app/shared/domain';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { TodoTagEntity } from '../todo-tag/todo-tag.entity';
import { UserEntity } from '../user/user.entity';

@Entity()
export class TodoEntity implements Required<Todo> {
  @PrimaryColumn('text')
  id!: string;

  @Column()
  content!: string;

  @Column()
  done!: boolean;

  @Column()
  dateCreated!: Date;

  @Column()
  dateUpdated!: Date;

  @ManyToOne(() => UserEntity, (e) => e.todos)
  user!: UserEntity;

  @OneToMany(() => TodoTagEntity, (e) => e.todo)
  todoTags!: TodoTagEntity[];
}
