import { RuleMetaData } from '@typescript-eslint/utils/dist/ts-eslint';
import { Rule } from 'eslint';
import { ObjectExpression, Property } from 'estree';
import fs from 'fs';
import path from 'path';
import { FileFilter, isExcluded, onlySheriffConfig } from './utils/file-filter';

interface PropertyWithParent extends Property, Rule.NodeParentExtension {}

const SHERIFF_CONFIG_FILENAME = '/sheriff.config.ts';
const FILE_PATH_CONFIG_KEYS = ['modules', 'tagging'] as const;
const PLACEHOLDER_REGEX = /<[a-zA-Z0-9]+>/;

const sheriffConfigRuleMeta: RuleMetaData<string> = {
  type: 'problem',
  docs: {
    description: 'Ensure file paths in sheriff.config.ts are valid',
  },
  messages: {
    invalidPath:
      "User Error: File path '{{ filePath }}' is not a real folder or barrel file",
  },
  schema: [],
};

const getProjectRoot = (filename: string): string =>
  filename.slice(0, filename.indexOf(SHERIFF_CONFIG_FILENAME));

const getPropertyKey = ({ key }: Property): string => {
  switch (key.type) {
    case 'Identifier':
      return key.name;
    case 'Literal':
      return String(key.value);
    default:
      return '';
  }
};

const collectPaths = (obj: ObjectExpression, prefix = ''): string[] => {
  const paths: string[] = [];

  for (const property of obj.properties) {
    if (property.type !== 'Property') continue;

    const key = getPropertyKey(property);
    const currentPath = prefix ? `${prefix}/${key}` : key;

    if (property.value.type === 'ArrayExpression') {
      paths.push(currentPath.split(PLACEHOLDER_REGEX)[0].replace(/\/$/g, ''));
    } else if (property.value.type === 'ObjectExpression') {
      paths.push(...collectPaths(property.value, currentPath));
    }
  }

  return paths;
};

const validatePaths = (
  paths: string[],
  node: PropertyWithParent,
  context: Rule.RuleContext,
): void => {
  for (const filePath of paths) {
    if (!fs.existsSync(filePath)) {
      context.report({
        node,
        messageId: 'invalidPath',
        data: { filePath },
      });
    }
  }
};

const processModule = (
  module: PropertyWithParent,
  projectRoot: string,
  context: Rule.RuleContext,
): void => {
  if (module.key.type !== 'Literal') return;

  const modulePath = String(module.key.value);
  const fullPath = path.join(projectRoot, modulePath);

  if (module.value.type === 'ObjectExpression') {
    const paths = collectPaths(module.value, fullPath);
    validatePaths(paths, module, context);
  }
};

const createSheriffConfigRule = (
  meta: RuleMetaData<string>,
  fileFilter: FileFilter,
  executor: (node: PropertyWithParent, context: Rule.RuleContext) => void,
): Rule.RuleModule => ({
  meta,
  create: (context) => {
    const filename = context.filename ?? context.getFilename();
    if (isExcluded(fileFilter, filename)) {
      return {};
    }

    return {
      Property(node) {
        executor(node, context);
      },
    };
  },
});

export const validateSheriffConfig = createSheriffConfigRule(
  sheriffConfigRuleMeta,
  onlySheriffConfig,
  (node, context) => {
    if (
      node.key.type !== 'Identifier' ||
      !FILE_PATH_CONFIG_KEYS.includes(
        node.key.name as (typeof FILE_PATH_CONFIG_KEYS)[number],
      )
    ) {
      return;
    }

    if (node.value.type !== 'ObjectExpression') return;

    const projectRoot = getProjectRoot(context.filename);
    node.value.properties
      .filter(
        (module): module is PropertyWithParent =>
          module.type === 'Property' && 'parent' in module,
      )
      .forEach((module) => processModule(module, projectRoot, context));
  },
);
