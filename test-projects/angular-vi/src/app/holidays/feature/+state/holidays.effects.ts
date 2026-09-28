import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Holiday } from '@eternal/holidays/model';
import { Configuration } from '@eternal/shared/config';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map, switchMap } from 'rxjs/operators';
import { holidaysActions } from './holidays.actions';

@Injectable()
export class HolidaysEffects {
  #actions$ = inject(Actions);
  #httpClient = inject(HttpClient);
  #config = inject(Configuration);
  #baseUrl = '/holiday';

  load$ = createEffect(() => {
    return this.#actions$.pipe(
      ofType(holidaysActions.load),
      switchMap(() => this.#httpClient.get<Holiday[]>(this.#baseUrl)),
      map((holidays) =>
        holidays.map((holiday) => ({
          ...holiday,
          imageUrl: `${this.#config.baseUrl}${holiday.imageUrl}`,
        }))
      ),
      map((holidays) => holidaysActions.loaded({ holidays }))
    );
  });

  addFavourite$ = createEffect(() => {
    return this.#actions$.pipe(
      ofType(holidaysActions.addFavourite),
      concatMap(({ id }) =>
        this.#httpClient
          .post<void>(`${this.#baseUrl}/favourite/${id}`, {})
          .pipe(map(() => holidaysActions.favouriteAdded({ id })))
      )
    );
  });

  removeFavourite$ = createEffect(() => {
    return this.#actions$.pipe(
      ofType(holidaysActions.removeFavourite),
      concatMap(({ id }) =>
        this.#httpClient
          .delete(`${this.#baseUrl}/favourite/${id}`)
          .pipe(map(() => holidaysActions.favouriteRemoved({ id })))
      )
    );
  });
}
