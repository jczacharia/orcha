import { IProps } from '@orcha/common';
import { User } from '../../../shared/domain/user';
import { IBaseRepository } from '../../common/base-repository';

export abstract class UserRepoPort extends IBaseRepository<User> {
  abstract findByEmail(email: string): Promise<IProps<User> | null>;
  abstract findByEmailOrFail(email: string): Promise<IProps<User>>;
  abstract createUser(email: string, passwordHash: string, salt: string): Promise<IProps<User>>;
}
