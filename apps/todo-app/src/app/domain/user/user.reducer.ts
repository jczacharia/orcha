import { createReducer, on } from '@ngrx/store';
import { IExtractOperationReturnSchema } from '@orcha/angular';
import { IUserOrchestration } from '@todo-example-app-lib/shared';
import * as UserActions from './user.actions';

export const USER_KEY = 'user';

export type UserStoreModel = IExtractOperationReturnSchema<IUserOrchestration['getProfile']>;

export interface UserState extends UserStoreModel {
  loaded: boolean;
}

const initialState: UserState = {
  id: '',
  email: '',
  dateCreated: '',
  dateLastLoggedIn: '',
  tags: [],
  todos: [],
  loaded: false,
};

export const UserReducer = createReducer(
  initialState,
  on(UserActions.userLoginSuccess, (state, { email }): UserState => {
    return { ...state, email };
  }),
  on(UserActions.getProfileSuccess, (state, { user }): UserState => {
    return {
      ...state,
      ...user,
      loaded: true,
    };
  }),
  on(UserActions.updateProfilePicSuccess, (state, { user }): UserState => {
    return {
      ...state,
      ...user,
    };
  })
);
