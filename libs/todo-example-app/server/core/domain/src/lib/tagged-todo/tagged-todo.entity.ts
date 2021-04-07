import { TaggedTodo } from '@orcha-todo-example-app/shared/domain';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { TagEntity } from '../tag/tag.entity';
import { TodoEntity } from '../todo/todo.entity';

@Entity()
export class TaggedTodoEntity implements Required<TaggedTodo> {
  @PrimaryColumn('text')
  id!: string;

  @Column()
  dateLinked!: Date;

  @ManyToOne(() => TodoEntity, (e) => e.taggedTodos)
  todo!: TodoEntity;

  @ManyToOne(() => TagEntity, (e) => e.taggedTodos)
  tag!: TagEntity;
}
