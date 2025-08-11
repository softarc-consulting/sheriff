/**
 * Default list of file extensions that Sheriff will ignore while traversing imports.
 * Imports whose module specifier ends with any of these extensions are skipped entirely
 * and not added to the dependency graph.
 */
export const defaultIgnoreFileExtensions: string[] = [
  // images
  'svg',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'ico',
  // styles
  'css',
  'scss',
  'sass',
  'less',
  // fonts
  'woff',
  'woff2',
  'ttf',
  'eot',
  'otf',
  // audio
  'mp3',
  'wav',
  'ogg',
  // video
  'mp4',
  'webm',
  'mov',
  // data / misc
  'json',
  'csv',
  'xml',
  'txt',
  'md',
];
