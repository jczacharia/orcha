import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState, USER_KEY } from './user.reducer';

const getUserState = createFeatureSelector<UserState>(USER_KEY);
export const getState = createSelector(getUserState, (state: UserState) => state);
