import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  #loading$ = new BehaviorSubject(false);
  loading$ = this.#loading$.asObservable();

  start() {
    this.#loading$.next(true);
  }

  stop() {
    this.#loading$.next(false);
  }
}
