import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { Message } from './message';
import { MessageStore } from './message.store';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'eternal-message',
  templateUrl: './message.component.html',
  styles: [
    `
      .error {
        background: #f44336;
        color: white;
      }

      .info {
        background: #2193b0;
        color: white;
      }
    `,
  ],
  standalone: true,
  imports: [MatIconModule, NgClass, NgForOf, NgIf],
  animations: [
    trigger('myTrigger', [
      transition(':enter', [
        style({ opacity: '0' }),
        animate('500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: '1' }),
        animate('500ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class MessageComponent {
  flag = true;
  state = 'fadeInFlash';

  constructor(messageStore: MessageStore) {
    messageStore.messages$.subscribe((message) => {
      this.messages.push(message);
      window.setTimeout(
        () => (this.messages = this.messages.filter((m) => m !== message)),
        3000
      );
    });
  }
  messages: Message[] = [];
}
