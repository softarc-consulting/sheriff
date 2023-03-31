export interface Holiday {
  id: number;
  title: string;
  teaser: string;
  description: string;
  imageUrl: string;
  typeId: number;
  durationInDays: number;
  minCount: number;
  maxCount: number;
  soldOut: boolean;
  onSale: boolean;
}

let id = 1;

export function createHoliday(holiday: Partial<Holiday> = {}): Holiday {
  return {
    ...{
      id: id++,
      title: 'Vienna',
      teaser: 'A holiday to Vienna',
      description:
        'This is the description of this holiday. Should be a little bit longer than the teaser',
      imageUrl: 'dummy.jpg',
      typeId: 1,
      durationInDays: 3,
      minCount: 5,
      maxCount: 12,
      soldOut: false,
      onSale: false,
    },
    ...holiday,
  };
}

export function createHolidays(...holidays: Partial<Holiday>[]) {
  return holidays.map(createHoliday);
}
