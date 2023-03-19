// https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types/53229567#53229567
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

export type MatcherContext = {
  placeholders: Record<string, string>;
  regexMatch?: RegExpMatchArray | null;
};

export type TagMatcherFn<ReturnType extends string | string[]> = (
  segment: string,
  context: MatcherContext
) => ReturnType;

export type SingleTag = {
  tag?: string | TagMatcherFn<string>;
};

export type MultiTags = {
  tags?: string[] | TagMatcherFn<string[]>;
};

export type TagConfig = Record<
  string,
  {
    tags?: string[] | string | TagMatcherFn<string[] | string>;
    children?: TagConfig;
  }
>;
