import { IManyToOne } from '@orcha/common';
import { Tag } from '../tag';
import { Todo } from '../todo';

/**
 * Facilitates a Many-To-Many relationship with Todos and Tags.
 */
export interface TaggedTodo {
  id: string;
  dateLinked: Date | string;
  todo: IManyToOne<TaggedTodo, Todo>;
  tag: IManyToOne<TaggedTodo, Tag>;
}
