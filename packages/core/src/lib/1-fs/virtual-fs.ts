import { Fs } from './fs';
import throwIfNull from '../util/throw-if-null';
import { FsPath, assertFsPath } from '../2-file-info/fs-path';
import * as path from 'path';

type FsNodeType = 'file' | 'directory';

type FsNode = {
  parent: FsNode | undefined;
  children: Map<string, FsNode>;
  contents: string;
  type: FsNodeType;
  name: string;
};

type GetPathReturnSuccess = {
  exists: true;
  node: FsNode;
  parent: FsNode | undefined;
  nodeName: string;
};

type GetPathReturnFailure = {
  exists: false;
  node: undefined;
  parent: FsNode;
  restPaths: string[];
};

type GetPathReturn = GetPathReturnSuccess | GetPathReturnFailure;

export class VirtualFs extends Fs {
  // non-null assertion is used because Ts can't infer the init call
  root!: FsNode;
  project!: FsNode;

  constructor() {
    super();
    this.init();
  }

  init() {
    this.root = {
      parent: undefined,
      children: new Map<string, FsNode>(),
      contents: '',
      type: 'directory',
      name: 'root',
    };

    this.project = {
      parent: this.root,
      children: new Map<string, FsNode>(),
      contents: '',
      type: 'directory',
      name: 'project',
    };
    this.root.children.set('project', this.project);
  }

  findFiles = (path: FsPath, filename: string): FsPath[] => {
    const result = this.#getNode(path);
    if (!result.exists) {
      throw new Error(`directory ${path} does not exist`);
    } else if (result.node.type !== 'directory') {
      throw new Error(`${path} is not a directory`);
    }

    const referenceNode = result.node;
    return this.#traverseFindFiles(referenceNode, filename, referenceNode);
  };

  createDir = (path: string): void => {
    const node = this.#makeOrGet(path, 'directory');
    if (node.type === 'file') {
      throw new Error(`cannot create directory ${path} because it is a file`);
    }
  };

  override exists(path: string): path is FsPath {
    return this.#getNode(path).exists;
  }

  writeFile = (path: string, contents: string): void => {
    const node = this.#makeOrGet(path, 'file');
    if (node.type === 'directory') {
      throw new Error(`cannot write to file ${path} because it is a directory`);
    }
    node.contents = contents;
  };

  readFile = (path: string): string => {
    const result = this.#getNode(path);
    if (!result.exists) {
      throw new Error(`File ${path} does not exist`);
    } else if (result.node.type === 'directory') {
      throw new Error(
        `cannot read from file ${path} because it is a directory`
      );
    } else {
      return result.node.contents;
    }
  };

  removeDir = (path: string): void => {
    const result = this.#getNode(path);
    if (!result.exists) {
      throw new Error(
        `cannot delete directory ${path} because it does not exist`
      );
    }
    if (result.parent === undefined) {
      throw new Error(`cannot delete root directory`);
    }
    result.parent.children.delete(result.nodeName);
  };

  tmpdir = () => '/tmp';

  findNearestParentFile = (referenceFile: FsPath, filename: string): FsPath => {
    const { node } = this.#getNodeOrThrow(referenceFile);
    let current = throwIfNull(
      node.parent,
      `${referenceFile} must have a parent`
    );
    while (current.parent !== undefined) {
      const searchedNode = Array.from(current.children.values()).find(
        (childNode) => childNode.name === filename && childNode.type === 'file'
      );
      if (searchedNode) {
        return this.#absolutePath(searchedNode);
      }
      current = current.parent;
    }

    throw new Error(`cannot find ${filename} near ${referenceFile}`);
  };

  isAbsolute = (path: string) => path.startsWith('/');

  #makeOrGet = (path: string, type: FsNodeType): FsNode => {
    const result = this.#getNode(path);
    if (result.exists) {
      return result.node;
    }
    if (result.parent === undefined) {
      throw new Error(`could not determine root in ${path}`);
    }

    let node = result.parent;

    for (let i = 0; i < result.restPaths.length; i++) {
      const path = result.restPaths[i];
      const childNode = this.#createNode(
        node,
        i === result.restPaths.length - 1 ? type : 'directory',
        path
      );
      node.children.set(path, childNode);
      node = childNode;
    }

    return node;
  };

  #getNode = (path: string): GetPathReturn => {
    let node = path.startsWith('/') ? this.root : this.project;
    const paths = path.split('/').filter(Boolean);
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (path === '..') {
        if (node.parent === undefined) {
          throw new Error('/ has no parent');
        }
        node = node.parent;
      } else if (path !== '.') {
        const childNode = node.children.get(path);
        if (childNode) {
          node = childNode;
        } else {
          return {
            exists: false,
            node: undefined,
            parent: node,
            restPaths: paths.slice(i),
          };
        }
      }
    }

    return {
      exists: true,
      node,
      parent: node.parent,
      nodeName: paths.at(-1) || '',
    };
  };

  #getNodeOrThrow = (path: string): GetPathReturnSuccess => {
    const response = this.#getNode(path);
    if (!response.exists) {
      throw new Error(`file ${path} does not exist`);
    }

    return response;
  };

  #createNode(parent: FsNode, type: FsNodeType, name: string): FsNode {
    return {
      parent,
      children: new Map<string, FsNode>(),
      contents: '',
      type,
      name,
    };
  }

  #traverseFindFiles = (
    node: FsNode,
    filename: string,
    referenceNode: FsNode
  ): FsPath[] => {
    const found: FsPath[] = [];
    for (const childNode of node.children.values()) {
      if (
        childNode.type === 'file' &&
        childNode.name === filename.toLowerCase()
      ) {
        found.push(this.#absolutePath(childNode));
      }

      if (childNode.type === 'directory') {
        found.push(
          ...this.#traverseFindFiles(childNode, filename, referenceNode)
        );
      }
    }

    return found;
  };

  #absolutePath = (node: FsNode): FsPath => {
    const paths = [];
    let current = node;
    while (current.parent !== undefined && current !== this.root) {
      paths.push(current.name);
      current = current.parent;
    }

    return assertFsPath('/' + paths.reverse().join('/'));
  };

  print = (node?: FsNode, indent = 0): void => {
    if (node === undefined) {
      console.log('[root]');
      return this.print(this.root, indent + 2);
    }

    for (const child of node.children.keys()) {
      const childNode = node.children.get(child);
      console.log(
        `${' '.repeat(indent)}${
          childNode?.type === 'directory' ? '[' + child + ']' : child
        }`
      );
      this.print(node.children.get(child), indent + 2);
    }
  };

  cwd = () => '/project';

  reset() {
    this.init();
  }

  override split(path: string): string[] {
    return path.split('/');
  }

  override join(...paths: string[]): string {
    return path.join(...paths).replace(/\\/g, '/');
  }
}

const virtualFs = new VirtualFs();
export default virtualFs;
