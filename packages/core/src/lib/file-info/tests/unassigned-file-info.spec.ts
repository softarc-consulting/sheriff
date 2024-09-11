import {UnassignedFileInfo} from '../unassigned-file-info';
import { toFsPath } from '../fs-path';
import getFs, { useVirtualFs } from '../../fs/getFs';
import { describe, beforeEach, beforeAll, it, expect } from 'vitest';
import {buildFileInfo} from "../../test/build-file-info";

const fi = (path: string, imports: UnassignedFileInfo[] = []) =>
  new UnassignedFileInfo(toFsPath(path), imports);

describe('Find File', () => {
  beforeAll(() => {
    useVirtualFs();
  });

  beforeEach(() => {
    getFs().reset();
  });

  it('should generate a single FileInfo', () => {
    expect(buildFileInfo('/src/app/app.component.ts')).toEqual(
      fi('/src/app/app.component.ts'),
    );
  });

  it('should generate nested', () => {
    const fileInfo = buildFileInfo('/apps/main.ts', [
      '/apps/customers/customer.component.ts',
      '/apps/customers/index.ts',
    ]);

    expect(fileInfo).toEqual(
      fi('/apps/main.ts', [
        fi('/apps/customers/customer.component.ts'),
        fi('/apps/customers/index.ts'),
      ]),
    );
  });

  it('should have multi-nested', () => {
    const fileInfo = buildFileInfo('/apps/main.ts', [
      [
        '/apps/customers/index.ts',
        [
          '/apps/customers/customer.component.ts',
          '/apps/customers/customer.service.ts',
        ],
      ],
    ]);

    expect(fileInfo).toEqual(
      fi('/apps/main.ts', [
        fi('/apps/customers/index.ts', [
          fi('/apps/customers/customer.component.ts'),
          fi('/apps/customers/customer.service.ts'),
        ]),
      ]),
    );
  });

  it('should append path if relative', () => {
    expect(buildFileInfo('/app/main.ts', ['./customer/index.ts'])).toEqual(
      fi('/app/main.ts', [fi('/app/customer/index.ts')]),
    );
  });

  it('should work with relative in same directory', () => {
    expect(buildFileInfo('/app/main.ts', ['./app.component.ts'])).toEqual(
      fi('/app/main.ts', [fi('/app/app.component.ts')]),
    );
  });

  it('should append path nested-ly if relative', () => {
    expect(
      buildFileInfo('/app/main.ts', [
        ['./customer/index.ts', ['./feature/index.ts']],
      ]),
    ).toEqual(
      fi('/app/main.ts', [
        fi('/app/customer/index.ts', [fi('/app/customer/feature/index.ts')]),
      ]),
    );
  });
});
