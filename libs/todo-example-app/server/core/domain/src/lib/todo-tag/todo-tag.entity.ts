import { TodoTag } from '@orcha-todo-example-app/shared/domain';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { TagEntity } from '../tag/tag.entity';
import { TodoEntity } from '../todo/todo.entity';

@Entity()
export class TodoTagEntity implements Required<TodoTag> {
  @PrimaryColumn('text')
  id!: string;

  @Column()
  dateLinked!: Date;

  @ManyToOne(() => TodoEntity, (e) => e.todoTags)
  todo!: TodoEntity;

  @ManyToOne(() => TagEntity, (e) => e.todoTags)
  tag!: TagEntity;
}
