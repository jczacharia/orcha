import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { IOrchaMikroOrmEntity } from '@orcha/mikro-orm';
import { User } from '@todo-example-app-lib/shared';
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

  @Property({ name: 'view' })
  async view() {
    return { totalTodos: await this.todos.loadCount() };
  }

  @OneToMany(() => TodoEntity, (e) => e.user)
  todos = new Collection<TodoEntity>(this);

  @OneToMany(() => TagEntity, (e) => e.user)
  tags = new Collection<TagEntity>(this);
}
