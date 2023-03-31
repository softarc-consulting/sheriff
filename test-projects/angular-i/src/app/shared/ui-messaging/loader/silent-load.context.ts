import { HttpContextToken } from '@angular/common/http';

export const SILENT_LOAD_CONTEXT = new HttpContextToken(() => false);
