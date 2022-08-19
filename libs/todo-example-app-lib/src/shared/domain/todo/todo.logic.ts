import { createLogic } from '@orcha/common';
import { Todo } from './todo.model';

/**
 * Super important business logic calculation for figuring out if a todo item is done or not.
 */
export const isTodoDone = createLogic<Todo>()({ done: true })((todo) => todo.done);

/**
 * Does a comparison to a todo's content.
 */
export const compareTodoContent = createLogic<Todo>()({ content: true })(
  (todo, compare: string) => todo.content === compare
);

/**
 * Example comparing two todo entities using currying.
 */
export const compareTwoTodos = createLogic<Todo>()({ content: true })(
  (todo) => (compare: typeof todo) => todo.content === compare.content
);
