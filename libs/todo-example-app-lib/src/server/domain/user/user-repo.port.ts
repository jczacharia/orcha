import { IProps, OrchaBaseRepositoryPort } from '@orcha/common';
import { User } from '../../../shared/domain/user';

export abstract class UserRepoPort extends OrchaBaseRepositoryPort<User> {
  abstract findByEmail(email: string): Promise<IProps<User> | null>;
  abstract findByEmailOrFail(email: string): Promise<IProps<User>>;
}
