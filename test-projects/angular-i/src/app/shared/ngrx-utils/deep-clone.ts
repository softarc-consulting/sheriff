import { map, Observable } from 'rxjs';

export function deepClone<T>(source$: Observable<T>): Observable<T> {
  return source$.pipe(map((object) => structuredClone(object)));
}
