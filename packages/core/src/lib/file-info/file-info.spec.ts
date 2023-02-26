import FileInfo, { buildFileInfo } from './file-info';
import { describe, it, expect } from 'vitest';

describe('Find File', () => {
  it('should generate a single FileInfo', () => {
    expect(buildFileInfo('src/app/app.component.ts')).toEqual(
      new FileInfo('src/app/app.component.ts')
    );
  });

  it('should exclude external libs', () => {
    expect(
      buildFileInfo('src/app/app.component.ts', ['@angular/core'])
    ).toEqual(
      new FileInfo('src/app/app.component.ts', [new FileInfo('@angular/core')])
    );
  });

  it('should generate nested', () => {
    const fileInfo = buildFileInfo('apps/main.ts', [
      'apps/customers/customer.component.ts',
      'apps/customers/index.ts',
    ]);

    expect(fileInfo).toEqual(
      new FileInfo('apps/main.ts', [
        new FileInfo('apps/customers/customer.component.ts', []),
        new FileInfo('apps/customers/index.ts', []),
      ])
    );
  });

  it('should have multi-nested', () => {
    const fileInfo = buildFileInfo('apps/main.ts', [
      [
        'apps/customers/index.ts',
        [
          'apps/customers/customer.component.ts',
          'apps/customers/customer.service.ts',
        ],
      ],
    ]);

    expect(fileInfo).toEqual(
      new FileInfo('apps/main.ts', [
        new FileInfo('apps/customers/index.ts', [
          new FileInfo('apps/customers/customer.component.ts'),
          new FileInfo('apps/customers/customer.service.ts'),
        ]),
      ])
    );
  });

  it('should append path if relative', () => {
    expect(buildFileInfo('app/main.ts', ['./customer/index.ts'])).toEqual(
      new FileInfo('app/main.ts', [new FileInfo('app/customer/index.ts')])
    );
  });

  it('should work with relative in same directory', () => {
    expect(buildFileInfo('app/main.ts', ['./app.component.ts'])).toEqual(
      new FileInfo('app/main.ts', [new FileInfo('app/app.component.ts')])
    );
  });

  it('should append path nestedly if relative', () => {
    expect(
      buildFileInfo('app/main.ts', [
        ['./customer/index.ts', ['./feature/index.ts']],
      ])
    ).toEqual(
      new FileInfo('app/main.ts', [
        new FileInfo('app/customer/index.ts', [
          new FileInfo('app/customer/feature/index.ts'),
        ]),
      ])
    );
  });
});
