import UnassignedFileInfo from '../../file-info/unassigned-file-info';
import { FsPath } from '../../file-info/fs-path';

export const angularCliValid = new UnassignedFileInfo(
  'src/app/app.component' as FsPath,
  [
    new UnassignedFileInfo('src/app/customers/index.ts' as FsPath, [
      new UnassignedFileInfo(
        'src/app/customers/customer.component.ts' as FsPath,
      ),
    ]),
    new UnassignedFileInfo('src/app/holidays/index.ts' as FsPath, [
      new UnassignedFileInfo('src/app/holidays/holiday.component.ts' as FsPath),
    ]),
  ],
);
