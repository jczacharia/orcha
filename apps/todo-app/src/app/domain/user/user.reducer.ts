import { createReducer, on } from '@ngrx/store';
import { IParserSerialized } from '@orcha/common';
import { EntireProfile, User } from '@todo-example-app-lib/shared';
import * as UserActions from './user.actions';

export const USER_KEY = 'user';

export type UserStoreModel = IParserSerialized<User, typeof EntireProfile>;

export interface UserState extends UserStoreModel {
  loaded: boolean;
}

const initialState: UserState = {} as UserState;

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
