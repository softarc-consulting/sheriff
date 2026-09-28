import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { Holiday } from '@eternal/holidays/model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BlinkerDirective } from '@eternal/shared/ui';
import { NgClass } from '@angular/common';
import { RouterLinkWithHref } from '@angular/router';

@Component({
    selector: 'eternal-holiday-card',
    templateUrl: './holiday-card.component.html',
    styleUrls: ['./holiday-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
    MatCardModule,
    MatButtonModule,
    BlinkerDirective,
    MatIconModule,
    NgClass,
    RouterLinkWithHref
]
})
export class HolidayCardComponent {
  @Input() holiday: (Holiday & { isFavourite: boolean }) | undefined;
  @Output() addFavourite = new EventEmitter<number>();
  @Output() removeFavourite = new EventEmitter<number>();
}
