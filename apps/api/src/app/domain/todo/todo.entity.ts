import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { ORCHA_VIEW } from '@orcha/common';
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

  @Property({ name: ORCHA_VIEW })
  async [ORCHA_VIEW]() {
    return { numOfTaggedTodos: await this.taggedTodos.loadCount() };
  }
}
