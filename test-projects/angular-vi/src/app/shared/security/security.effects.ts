import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs/operators';
import { securityActions } from './security.actions';
import { User } from './security.reducer';

@Injectable()
export class SecurityEffects {
  #actions$ = inject(Actions);
  #httpClient = inject(HttpClient);

  loadUser$ = createEffect(() => {
    return this.#actions$.pipe(
      ofType(securityActions.loadUser),
      switchMap(() => this.#httpClient.get<User>('/security/user-info')),
      map((user) => securityActions.loadUserSuccess({ user }))
    );
  });

  signInUser$ = createEffect(() => {
    return this.#actions$.pipe(
      ofType(securityActions.signInUser),
      switchMap(({ email, password }) =>
        this.#httpClient.post<User>('/security/sign-in', { email, password })
      ),
      map((user) => securityActions.signInUserSuccess({ user }))
    );
  });

  signOutUser$ = createEffect(() => {
    return this.#actions$.pipe(
      ofType(securityActions.signOutUser),
      switchMap(() => this.#httpClient.post<User>('/security/sign-out', {})),
      map((user) => securityActions.signOutUserSuccess({ user }))
    );
  });
}
