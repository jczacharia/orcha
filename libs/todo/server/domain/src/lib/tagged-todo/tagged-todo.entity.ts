import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { IOrchaMikroOrmEntity } from '@orcha/mikro-orm';
import { Tag, TaggedTodo } from '@orcha/todo/shared/domain';
import { TagEntity } from '../tag/tag.entity';
import { TodoEntity } from '../todo/todo.entity';

@Entity()
export class TaggedTodoEntity implements IOrchaMikroOrmEntity<TaggedTodo> {
  @PrimaryKey()
  id!: string;

  @Property()
  dateLinked!: Date;

  @ManyToOne(() => TodoEntity)
  todo!: TodoEntity;

  @ManyToOne(() => TagEntity)
  tag!: IOrchaMikroOrmEntity<Tag>;
}
