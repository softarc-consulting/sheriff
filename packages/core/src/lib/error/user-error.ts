export type UserErrorCode =
  | 'SH-001'
  | 'SH-002'
  | 'SH-003'
  | 'SH-004'
  | 'SH-005'
  | 'SH-006'
  | 'SH-007'
  | 'SH-008'
  | 'SH-009'
  | 'SH-010'
  | 'SH-011'
  | 'SH-012';

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

export class MissingModulesWithoutAutoTaggingError extends UserError {
  constructor() {
    super(
      'SH-007',
      'sheriff.config.ts must have either modules or autoTagging set to true',
    );
  }
}

export class TaggingAndModulesError extends UserError {
  constructor() {
    super(
      'SH-008',
      'sheriff.config.ts contains both tagging and modules. Use only modules.',
    );
  }
}

export class CollidingEncapsulationSettings extends UserError {
  constructor() {
    super(
      'SH-009',
      'sheriff.config.ts contains both encapsulatedFolderNameForBarrelLess and encapsulationPatternForBarrellLess. Use encapsulationPatternForBarrellLess.',
    );
  }
}

export class TsExtendsResolutionError extends UserError {
  constructor(tsConfigPath: string, extendsPath: string) {
    super(
      'SH-010',
      `Cannot resolve path ${extendsPath} of "extends" property in ${tsConfigPath}. Please verify that the path exists.`,
    );
  }
}

export class CollidingEntrySettings extends UserError {
  constructor() {
    super(
      'SH-011',
      'sheriff.config.ts contains both entryFile and entryPoints. Use only one of them.',
    );
  }
}

export class NoEntryPointsFoundError extends UserError {
  constructor() {
    super('SH-012', 'No entryPoints defined in sheriff.config.ts.');
  }
}
