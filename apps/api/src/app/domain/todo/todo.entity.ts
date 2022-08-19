import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { IOrchaMikroOrmEntity } from '@orcha/mikro-orm';
import { TaggedTodo, Todo, User } from '@todo-example-app-lib/shared';
import { TaggedTodoEntity } from '../tagged-todo/tagged-todo.entity';
import { UserEntity } from '../user/user.entity';

@Entity()
export class TodoEntity implements IOrchaMikroOrmEntity<Todo> {
  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property()
  content!: string;

  @Property()
  done!: boolean;

  @Property()
  dateCreated!: Date;

  @Property()
  dateUpdated!: Date;

  @ManyToOne(() => UserEntity)
  user!: IOrchaMikroOrmEntity<User>;

  @OneToMany(() => TaggedTodoEntity, (e) => e.todo, { orphanRemoval: true })
  taggedTodos = new Collection<IOrchaMikroOrmEntity<TaggedTodo>>(this);
}
