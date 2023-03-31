import { Holiday } from '@eternal/holidays/model';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const holidaysActions = createActionGroup({
  source: 'Holidays',
  events: {
    Load: emptyProps(),
    Loaded: props<{ holidays: Holiday[] }>(),
    'Add Favourite': props<{ id: number }>(),
    'Favourite Added': props<{ id: number }>(),
    'Remove Favourite': props<{ id: number }>(),
    'Favourite Removed': props<{ id: number }>(),
  },
});
