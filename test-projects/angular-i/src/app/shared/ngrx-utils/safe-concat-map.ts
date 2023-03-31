import { TypedAction } from '@ngrx/store/src/models';
import { catchError, concatMap, Observable, of, OperatorFunction } from 'rxjs';
import { noopAction } from './noop.action';

export function safeConcatMap<S, T extends string>(
  project: (value: S) => Observable<TypedAction<T>>
): OperatorFunction<S, TypedAction<T | '[Util] NOOP'>> {
  return (source$: Observable<S>): Observable<TypedAction<T | '[Util] NOOP'>> =>
    source$.pipe(
      concatMap((value) =>
        project(value).pipe(catchError(() => of(noopAction())))
      )
    );
}
