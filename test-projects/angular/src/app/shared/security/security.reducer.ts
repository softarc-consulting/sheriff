import { createFeature, createReducer, on } from '@ngrx/store';
import { securityActions } from './security.actions';

export interface User {
  id: number;
  email: string;
  firstname: string;
  name: string;
  anonymous: boolean;
}

export interface SecurityReducer {
  loaded: boolean;
  user: User | undefined;
}

const initialState: SecurityReducer = {
  loaded: false,
  user: undefined,
};

export const securityFeature = createFeature({
  name: 'security',
  reducer: createReducer<SecurityReducer>(
    initialState,
    on(
      securityActions.loadUserSuccess,
      securityActions.signInUserSuccess,
      (state, { user }): SecurityReducer => ({
        ...state,
        user,
        loaded: true,
      })
    ),
    on(
      securityActions.signOutUserSuccess,
      (state, { user }): SecurityReducer => ({
        ...state,
        user,
      })
    )
  ),
});
