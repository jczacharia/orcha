import { IOperation } from '@orcha/common';
import { LoginDto, SignUpDto } from './user.dtos';
import { User } from './user.model';
import { EntireProfile } from './user.queries';

export const USER_ORCHESTRATION_NAME = 'user';

export interface IUserOrchestration {
  login: IOperation<{ token: string }, { token: true }, LoginDto>;
  signUp: IOperation<{ token: string }, { token: true }, SignUpDto>;
  getProfile: IOperation<User, typeof EntireProfile>;
  updateProfilePic: IOperation<User, typeof EntireProfile, null, File[]>;
}
