import { HttpContext } from '@angular/common/http';
import { SILENT_LOAD_CONTEXT } from './silent-load.context';

export function withSilentLoadContext() {
  return new HttpContext().set(SILENT_LOAD_CONTEXT, true);
}
