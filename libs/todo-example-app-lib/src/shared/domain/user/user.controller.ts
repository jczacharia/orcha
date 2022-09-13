import { IOperation, IQuery } from '@orcha/common';
import { GetProfileDto, LoginDto, SignUpDto } from './user.dtos';
import { User } from './user.model';
import { EntireProfile } from './user.queries';

export const USER_CONTROLLER_NAME = 'user';

export interface IUserController {
  login: IOperation<{ token: string }, { token: true }, LoginDto>;
  signUp: IOperation<{ token: string }, { token: true }, SignUpDto>;
  getProfile: IOperation<User, IQuery<User>, GetProfileDto>;
  updateProfilePic: IOperation<User, typeof EntireProfile, null, File[]>;
}
