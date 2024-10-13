// https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types/53229567#53229567
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

export interface MatcherContext {
  segment: string;
  regexMatch?: RegExpMatchArray | null;
}

export type TagMatcherFn<ReturnType extends string | string[]> = (
  placeholders: Record<string, string>,
  context: MatcherContext,
) => ReturnType;

export interface SingleTag {
  tag?: string | TagMatcherFn<string>;
}

export interface MultiTags {
  tags?: string[] | TagMatcherFn<string[]>;
}

export type TagConfigValue =
  | string
  | string[]
  | TagMatcherFn<string[] | string>;

export interface ModuleConfig {
  [pathMatcher: string]: TagConfigValue | ModuleConfig;
}
