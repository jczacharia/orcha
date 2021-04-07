import { Todo } from '@orcha-todo-example-app/shared/domain';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { TaggedTodoEntity } from '../tagged-todo/tagged-todo.entity';
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

  @OneToMany(() => TaggedTodoEntity, (e) => e.todo)
  taggedTodos!: TaggedTodoEntity[];
}
