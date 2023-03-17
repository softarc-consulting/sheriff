import FileInfo from '../../file-info/file-info';
import { FsPath } from '../../file-info/fs-path';

export const angularCliValid = new FileInfo('src/app/app.component' as FsPath, [
  new FileInfo('src/app/customers/index.ts' as FsPath, [
    new FileInfo('src/app/customers/customer.component.ts' as FsPath),
  ]),
  new FileInfo('src/app/holidays/index.ts' as FsPath, [
    new FileInfo('src/app/holidays/holiday.component.ts' as FsPath),
  ]),
]);
