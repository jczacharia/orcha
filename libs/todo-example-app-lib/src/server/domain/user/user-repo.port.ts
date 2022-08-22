import { IParser, IQuery, OrchaBaseRepositoryPort } from '@orcha/common';
import { User } from '../../../shared/domain/user';

export abstract class UserRepoPort extends OrchaBaseRepositoryPort<User> {
  abstract findByEmail<Q extends IQuery<User>>(email: string, query: Q): Promise<IParser<User, Q> | null>;
  abstract findByEmailOrFail<Q extends IQuery<User>>(email: string, query: Q): Promise<IParser<User, Q>>;
}
