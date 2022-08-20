import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { TagEntity } from '../tag/tag.entity';
import { TodoEntity } from '../todo/todo.entity';

@Entity()
export class TaggedTodoEntity {
  @PrimaryKey()
  id!: string;

  @Property()
  dateLinked!: Date;

  @ManyToOne(() => TodoEntity)
  todo!: TodoEntity;

  @ManyToOne(() => TagEntity)
  tag!: TagEntity;
}
