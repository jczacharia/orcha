import { Collection, Entity, Formula, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { IOrchaMikroOrmEntity } from '@orcha/mikro-orm';
import { Todo } from '@todo-example-app-lib/shared';
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
  user!: UserEntity;

  @OneToMany(() => TaggedTodoEntity, (e) => e.todo, { orphanRemoval: true })
  taggedTodos = new Collection<TaggedTodoEntity>(this);

  @Formula(
    (alias) => `(SELECT COUNT(*) FROM tagged_todo_entity WHERE ${alias}.id = tagged_todo_entity.todo_id)::int`
  )
  viewNumOfTaggedTodos!: number;
}
