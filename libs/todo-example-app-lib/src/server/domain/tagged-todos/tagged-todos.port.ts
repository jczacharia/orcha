import { IExactQuery, IParser, IQuery, OrchaBaseRepositoryPort } from '@orcha/common';
import { TaggedTodo } from '../../../shared/domain/tagged-todo';

export abstract class TaggedTodoRepoPort extends OrchaBaseRepositoryPort<TaggedTodo> {
  abstract findTaggedTodo<Q extends IQuery<TaggedTodo>>(
    todoId: number,
    tagId: string,
    query: IExactQuery<TaggedTodo, Q>
  ): Promise<IParser<TaggedTodo, Q> | null>;

  abstract deleteTaggedTodoAndLonelyTags(taggedTodoId: TaggedTodo['id']): Promise<TaggedTodo['id']>;
}
