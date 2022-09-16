import { IOperationEvent, IOperationFileUpload, IOperationQuery, IOperationSimple } from '@orcha/common';
import { LoginDto, SignUpDto } from './user.dtos';
import { User } from './user.model';
import { EntireProfile } from './user.queries';

export const USER_CONTROLLER_NAME = 'user';

export interface IUserController {
  login: IOperationSimple<{ token: string }, { token: true }, LoginDto>;
  signUp: IOperationSimple<{ token: string }, { token: true }, SignUpDto>;
  getProfile: IOperationSimple<User, typeof EntireProfile>;
  updateProfilePic: IOperationFileUpload<User, typeof EntireProfile>;
  event: IOperationEvent<{ rtn: string }, { rtn: true }, { dtoData: string }>;
  queryProfile: IOperationQuery<User>;
}
