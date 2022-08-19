import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { IOrchaMikroOrmEntity } from '@orcha/mikro-orm';
import { Tag, Todo, User } from '@todo-example-app-lib/shared';
import { TagEntity } from '../tag/tag.entity';
import { TodoEntity } from '../todo/todo.entity';

@Entity()
export class UserEntity implements IOrchaMikroOrmEntity<User> {
  @PrimaryKey()
  id!: string;

  @Property({ unique: true })
  email!: string;

  @Property()
  passwordHash!: string;

  @Property()
  salt!: string;

  @Property()
  dateCreated!: Date;

  @Property({ nullable: true })
  dateLastLoggedIn?: Date;

  @OneToMany(() => TodoEntity, (e) => e.user)
  todos = new Collection<IOrchaMikroOrmEntity<Todo>>(this);

  @OneToMany(() => TagEntity, (e) => e.user)
  tags = new Collection<IOrchaMikroOrmEntity<Tag>>(this);
}
