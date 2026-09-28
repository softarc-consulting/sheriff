import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { holidaysActions } from '../+state/holidays.actions';
import { fromHolidays } from '../+state/holidays.selectors';
import { Holiday } from '@eternal/holidays/model';
import { HolidayCardComponent } from '@eternal/holidays/ui';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'eternal-holidays',
    template: `<h2>Choose among our Holidays</h2>
    <div class="flex flex-wrap justify-evenly">
      @for (holiday of holidays$ | async; track byId($index, holiday)) {
        <eternal-holiday-card
          [holiday]="holiday"
          (addFavourite)="addFavourite($event)"
          (removeFavourite)="removeFavourite($event)"
          >
        </eternal-holiday-card>
      }
    </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [AsyncPipe, HolidayCardComponent]
})
export class HolidaysComponent implements OnInit {
  #store = inject(Store);
  holidays$ = this.#store.select(fromHolidays.selectHolidaysWithFavourite);

  ngOnInit(): void {
    this.#store.dispatch(holidaysActions.load());
  }

  addFavourite(id: number) {
    this.#store.dispatch(holidaysActions.addFavourite({ id }));
  }

  removeFavourite(id: number) {
    this.#store.dispatch(holidaysActions.removeFavourite({ id }));
  }

  byId(index: number, holiday: Holiday) {
    return holiday.id;
  }
}
