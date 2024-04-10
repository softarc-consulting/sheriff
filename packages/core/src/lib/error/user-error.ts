export type UserErrorCode =
  | 'SH-001'
  | 'SH-002'
  | 'SH-003'
  | 'SH-004'
  | 'SH-005'
  | 'SH-006';

export class UserError extends Error {
  constructor(
    public code: UserErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export class InvalidPathError extends UserError {
  constructor(pathAlias: string, path: string) {
    super(
      'SH-001',
      `invalid path mapping detected: ${pathAlias}: ${path}. Please verify that the path exists.`,
    );
  }
}

export class NoDependencyRuleForTagError extends UserError {
  constructor(tag: string) {
    super(
      'SH-002',
      `No dependency rule for tag '${tag}' found in sheriff.config.ts`,
    );
  }
}

export class NoAssignedTagError extends UserError {
  constructor(moduleDir: string) {
    super('SH-003', `No assigned Tag for '${moduleDir}' in sheriff.config.ts`);
  }
}

export class TagWithoutValueError extends UserError {
  constructor(path: string) {
    super(
      'SH-004',
      `Tag configuration '/${path}' in sheriff.config.ts has no value`,
    );
  }
}

export class ExistingTagPlaceholderError extends UserError {
  constructor(placeholder: string) {
    super(
      'SH-005',
      `placeholder for value "${placeholder}" does already exist`,
    );
  }
}

export class InvalidPlaceholderError extends UserError {
  constructor(placeholder: string, path: string) {
    super(
      'SH-006',
      `cannot find a placeholder for "${placeholder}" in tag configuration. Module: ${path}`,
    );
  }
}
