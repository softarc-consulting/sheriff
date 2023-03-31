import { createSelector } from '@ngrx/store';
import { securityFeature } from './security.reducer';

const { selectUser, selectLoaded } = securityFeature;

const selectSignedIn = createSelector(
  selectUser,
  selectLoaded,
  (user, loaded) => loaded && !user?.anonymous
);

export const fromSecurity = {
  selectUser,
  selectLoaded,
  selectSignedIn,
};
