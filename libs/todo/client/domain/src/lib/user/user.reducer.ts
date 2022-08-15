import { createReducer, on } from '@ngrx/store';
import { IParser } from '@orcha/common';
import { User, UserQueryModel } from '@orcha/todo/shared/domain';
import * as UserActions from './user.actions';

export const USER_KEY = 'user';

export type UserStoreModel = IParser<User, typeof UserQueryModel>;

export interface UserState extends UserStoreModel {
  loaded: boolean;
}

const initialState: UserState = {
  id: '',
  view: { totalTodos: 0 },
  dateCreated: new Date(),
  dateLastLoggedIn: new Date(),
  loaded: false,
};

export const UserReducer = createReducer(
  initialState,
  on(UserActions.userLoginSuccess, (state, { id }): UserState => {
    return { ...state, id };
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
