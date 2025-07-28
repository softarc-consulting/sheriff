import { getRegisteredFormats } from './reporter-factory';

export type ReporterFormat = 'json' | 'junit';

export const SUPPORTED_REPORTER_FORMATS = getRegisteredFormats();
