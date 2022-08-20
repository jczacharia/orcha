import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { TaggedTodoEntity } from '../tagged-todo/tagged-todo.entity';
import { UserEntity } from '../user/user.entity';

@Entity()
export class TodoEntity {
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
}
