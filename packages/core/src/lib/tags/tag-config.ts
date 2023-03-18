export type PathMatcher<Type extends string> = Type extends `/${string}/`
  ? RegExpMatchArray
  : string;

export type SingleTag<Type extends string> = {
  tag:
    | string
    | ((
        path: PathMatcher<Type>,
        placeholders: Record<string, string>
      ) => string);
};
export type MultiTags<Type extends string> = {
  tags:
    | string[]
    | ((
        path: PathMatcher<Type>,
        placeholders: Record<string, string>
      ) => string[]);
};

export type TagConfig<Type extends string> = Record<
  Type,
  SingleTag<Type> | MultiTags<Type> | Record<string, never>
>;
