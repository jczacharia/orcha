import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { IOrchaMikroOrmEntity } from '@orcha/mikro-orm';
import { TaggedTodo } from '@todo-example-app-lib/shared';
import { TagEntity } from '../tag/tag.entity';
import { TodoEntity } from '../todo/todo.entity';

@Entity()
export class TaggedTodoEntity implements IOrchaMikroOrmEntity<TaggedTodo> {
  @PrimaryKey()
  id!: string;

  @Property()
  dateLinked!: Date;

  @ManyToOne(() => TodoEntity, { nullable: true })
  todo!: TodoEntity;

  @ManyToOne(() => TagEntity, { nullable: true })
  tag!: TagEntity;
}
