import { describe, it, expect } from 'vitest';
import { ModuleConfig } from '../../config/module-config';
import { flattenModules } from "../internal/flatten-modules";

describe('flatten tags', () => {
  it('should flatten', () => {
    const tagging: ModuleConfig = {
      'src/app': {
        customer: ['domain:customer'],
        holidays: 'domain:holidays',
        bookings: () => 'domain:bookings',
      },
    };

    expect(flattenModules(tagging)).toEqual([
      'src/app/customer',
      'src/app/holidays',
      'src/app/bookings',
    ]);
  });

  it('should flatten mixed hierarchy', () => {
    const tagging: ModuleConfig = {
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
    expect(flattenModules(tagging)).toEqual([
      'src/app/customer/feature',
      'src/app/holidays',
      'src/lib/shared',
    ]);
  });


  it('should mark tags as *', () => {
    const tagging: ModuleConfig = {
      src: {
        app: {
          customer: { 'feat-<feature>': 'feature', '<type>': '<type>' },
        },
      },
    };
    expect(flattenModules(tagging)).toEqual([
      'src/app/customer/feat-*',
      'src/app/customer/*',
    ]);
  });


  it('should flatten nested modules', () => {
    const tagging: ModuleConfig = {
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
    expect(flattenModules(tagging)).toEqual([
      'src/lib/customer',
      'src/lib/customer/*',
      'src/lib/shared',
    ]);
  });
});
