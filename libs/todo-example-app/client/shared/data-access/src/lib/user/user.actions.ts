import { createAction, props } from '@ngrx/store';
import { OrchaOperationError } from '@orcha/common';
import { UserStoreModel } from './user.reducer';

export const logout = createAction('[User] Logout');

/*
    _   _               _              _
   | | | |___ ___ _ _  | |   ___  __ _(_)_ _
   | |_| (_-</ -_) '_| | |__/ _ \/ _` | | ' \
    \___//__/\___|_|   |____\___/\__, |_|_||_|
                                 |___/
 */

export const userLogin = createAction('[User] User Login', props<{ id: string; password: string }>());

export const userLoginSuccess = createAction(
  '[User] User Login Success',
  props<{ id: string; token: string }>()
);

export const userLoginError = createAction(
  '[User] User Login Error',
  props<{ error: OrchaOperationError }>()
);

/*
    ___ _             _   _
   / __(_)__ _ _ _   | | | |_ __
   \__ \ / _` | ' \  | |_| | '_ \
   |___/_\__, |_||_|  \___/| .__/
         |___/             |_|
*/

export const userSignUp = createAction('[User] User SignUp', props<{ id: string; password: string }>());

export const userSignUpSuccess = createAction('[User] User SignUp Success', props<{ token: string }>());

export const userSignUpError = createAction(
  '[User] User SignUp Error',
  props<{ error: OrchaOperationError }>()
);

/*
     ___     _     ___          __ _ _     
    / __|___| |_  | _ \_ _ ___ / _(_) |___ 
   | (_ / -_)  _| |  _/ '_/ _ \  _| | / -_)
    \___\___|\__| |_| |_| \___/_| |_|_\___|
                                           
*/

export const getProfile = createAction('[User] Get Profile');

export const getProfileSuccess = createAction(
  '[User] Get Profile Success',
  props<{ user: UserStoreModel }>()
);

export const getProfileError = createAction(
  '[User] Get Profile Error',
  props<{ error: OrchaOperationError }>()
);
