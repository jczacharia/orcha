import { Cascade, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { IOrchaMikroOrmEntity } from '@orcha/mikro-orm';
import { Tag } from '@todo-example-app-lib/shared';
import { TaggedTodoEntity } from '../tagged-todo/tagged-todo.entity';
import { UserEntity } from '../user/user.entity';

@Entity()
export class TagEntity implements IOrchaMikroOrmEntity<Tag> {
  @PrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @Property()
  dateCreated!: Date;

  @Property()
  dateUpdated!: Date;

  @ManyToOne(() => UserEntity)
  user!: UserEntity;

  @OneToMany(() => TaggedTodoEntity, (e) => e.tag, { cascade: [Cascade.ALL], orphanRemoval: true })
  taggedTodos = new Collection<TaggedTodoEntity>(this);
}
