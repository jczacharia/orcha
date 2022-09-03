import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { ORCHA_VIEW } from '@orcha/common';
import { IOrchaMikroOrmEntity } from '@orcha/mikro-orm';
import { User } from '@todo-example-app-lib/shared';
import { TagEntity } from '../tag/tag.entity';
import { TodoEntity } from '../todo/todo.entity';

@Entity()
export class UserEntity implements IOrchaMikroOrmEntity<User> {
  @PrimaryKey()
  id!: string;

  @Property({ nullable: true })
  firstName!: string;

  @Property({ nullable: true })
  middleName!: string;

  @Property({ nullable: true })
  lastName!: string;

  @Property({ nullable: true })
  phone!: string;

  @Property({ unique: true })
  email!: string;

  @Property()
  passwordHash!: string;

  @Property()
  salt!: string;

  @Property()
  dateCreated!: Date;

  @Property()
  dateUpdated!: Date;

  @Property({ columnType: 'timestamp with time zone', nullable: true })
  dateLastLoggedIn!: Date;

  @Property({ name: ORCHA_VIEW })
  async [ORCHA_VIEW]() {
    return { numOfTodos: await this.todos.loadCount() };
  }

  @OneToMany(() => TodoEntity, (e) => e.user)
  todos = new Collection<TodoEntity>(this);

  @OneToMany(() => TagEntity, (e) => e.user)
  tags = new Collection<TagEntity>(this);
}
