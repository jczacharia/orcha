import { IExactQuery, IParser, IQuery, OrchaBaseRepositoryPort } from '@orcha/common';
import { Todo } from '../../../shared/domain/todo';

export abstract class TodoRepoPort extends OrchaBaseRepositoryPort<Todo> {
  abstract getByUser<Q extends IQuery<Todo>>(
    userId: string,
    query: IExactQuery<Todo, Q>
  ): Promise<IParser<Todo[], Q>>;
}
