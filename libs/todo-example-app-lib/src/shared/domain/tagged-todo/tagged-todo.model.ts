import { IManyToOne, IOrchaModel } from '@orcha/common';
import { Tag } from '../tag';
import { Todo } from '../todo';

/**
 * Facilitates a Many-To-Many relationship with Todos and Tags.
 */
export interface TaggedTodo extends IOrchaModel<string> {
  dateLinked: Date;
  todo: IManyToOne<Todo, 'taggedTodos'>;
  tag: IManyToOne<Tag, 'taggedTodos'>;
}
