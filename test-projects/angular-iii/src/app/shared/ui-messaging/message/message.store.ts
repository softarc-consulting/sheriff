import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Message } from './message';

@Injectable({ providedIn: 'root' })
export class MessageStore {
  #messages$ = new Subject<Message>();

  messages$ = this.#messages$.asObservable();

  add(message: Message) {
    this.#messages$.next(message);
  }
}
