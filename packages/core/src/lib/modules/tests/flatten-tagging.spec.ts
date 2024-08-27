import { describe, it, expect } from 'vitest';
import { TagConfig } from '../../config/tag-config';
import { flattenTagging } from "../internal/flatten-tagging";

describe('flatten tags', () => {
  it('should flatten', () => {
    const tagging: TagConfig = {
      'src/app': {
        customer: ['domain:customer'],
        holidays: 'domain:holidays',
        bookings: () => 'domain:bookings',
      },
    };

    expect(flattenTagging(tagging)).toEqual([
      'src/app/customer',
      'src/app/holidays',
      'src/app/bookings',
    ]);
  });

  it('should flatten mixed hierarchy', () => {
    const tagging: TagConfig = {
      src: {
        app: {
          customer: { feature: 'domain:customer' },
          holidays: 'domain:holidays',
        },
        lib: {
          shared: 'shared',
        },
      },
    };
    expect(flattenTagging(tagging)).toEqual([
      'src/app/customer/feature',
      'src/app/holidays',
      'src/lib/shared',
    ]);
  });


  it('should mark tags as *', () => {
    const tagging: TagConfig = {
      src: {
        app: {
          customer: { 'feat-<feature>': 'feature', '<type>': '<type>' },
        },
      },
    };
    expect(flattenTagging(tagging)).toEqual([
      'src/app/customer/feat-*',
      'src/app/customer/*',
    ]);
  });


  it('should flatten nested modules', () => {
    const tagging: TagConfig = {
      src: {
        'lib/customer': 'nx',
        lib: {
          customer: {
            '<type>': 'type:<type>',
          },
          shared: 'shared',
        },
      },
    };
    expect(flattenTagging(tagging)).toEqual([
      'src/lib/customer',
      'src/lib/customer/*',
      'src/lib/shared',
    ]);
  });
});
