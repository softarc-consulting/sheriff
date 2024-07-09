import { Action } from '@ngrx/store';
import { catchError, concatMap, Observable, of, OperatorFunction } from 'rxjs';
import { noopAction } from './noop.action';

export function safeConcatMap<S, T extends string>(
  project: (value: S) => Observable<Action<T>>
): OperatorFunction<S, Action<T | '[Util] NOOP'>> {
  return (source$: Observable<S>): Observable<Action<T | '[Util] NOOP'>> =>
    source$.pipe(
      concatMap((value) =>
        project(value).pipe(catchError(() => of(noopAction())))
      )
    );
}
