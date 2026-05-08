import { describe, it, expect } from 'vitest';
import { matchGlob } from './match-glob';

describe('matchGlob', () => {
  describe('exact matching', () => {
    it('should match identical strings', () => {
      expect(matchGlob('index.ts', 'index.ts')).toBe(true);
    });

    it('should not match different strings', () => {
      expect(matchGlob('index.ts', 'main.ts')).toBe(false);
    });

    it('should match empty pattern against empty text', () => {
      expect(matchGlob('', '')).toBe(true);
    });

    it('should not match empty pattern against non-empty text', () => {
      expect(matchGlob('', 'index.ts')).toBe(false);
    });

    it('should not match non-empty pattern against empty text', () => {
      expect(matchGlob('index.ts', '')).toBe(false);
    });
  });

  describe('case insensitivity', () => {
    it('should match case-insensitively', () => {
      expect(matchGlob('Index.ts', 'index.ts')).toBe(true);
    });

    it('should match uppercase pattern against lowercase text', () => {
      expect(matchGlob('INDEX.TS', 'index.ts')).toBe(true);
    });

    it('should match lowercase pattern against uppercase text', () => {
      expect(matchGlob('index.ts', 'INDEX.TS')).toBe(true);
    });
  });

  describe('star wildcard (*)', () => {
    it('should match any characters with *', () => {
      expect(matchGlob('index.*.ts', 'index.routing.ts')).toBe(true);
    });

    it('should match multiple characters with *', () => {
      expect(matchGlob('index.*.ts', 'index.state.ts')).toBe(true);
    });

    it('should match zero characters with *', () => {
      expect(matchGlob('index*.ts', 'index.ts')).toBe(true);
    });

    it('should match a leading *', () => {
      expect(matchGlob('*.ts', 'index.ts')).toBe(true);
    });

    it('should match a trailing *', () => {
      expect(matchGlob('index.*', 'index.ts')).toBe(true);
    });

    it('should match pattern with only *', () => {
      expect(matchGlob('*', 'anything')).toBe(true);
    });

    it('should match empty text against a single *', () => {
      expect(matchGlob('*', '')).toBe(true);
    });

    it('should match with multiple * wildcards', () => {
      expect(matchGlob('*index*ts*', 'my-index-file-ts-backup')).toBe(true);
    });

    it('should match dots with *', () => {
      expect(matchGlob('index.*.*', 'index.routing.ts')).toBe(true);
    });

    it('should not match when surrounding text does not match', () => {
      expect(matchGlob('index.*.ts', 'main.routing.ts')).toBe(false);
    });

    it('should not match when trailing text does not match', () => {
      expect(matchGlob('index.*.ts', 'index.routing.js')).toBe(false);
    });
  });

  describe('question mark wildcard (?)', () => {
    it('should match exactly one character with ?', () => {
      expect(matchGlob('index?.ts', 'index1.ts')).toBe(true);
    });

    it('should not match zero characters with ?', () => {
      expect(matchGlob('index?.ts', 'index.ts')).toBe(false);
    });

    it('should not match multiple characters with single ?', () => {
      expect(matchGlob('index?.ts', 'index12.ts')).toBe(false);
    });

    it('should match with multiple ? wildcards', () => {
      expect(matchGlob('index??.ts', 'index12.ts')).toBe(true);
    });

    it('should match any character including dots', () => {
      expect(matchGlob('index?ts', 'index.ts')).toBe(true);
    });
  });

  describe('combined wildcards', () => {
    it('should handle * and ? together', () => {
      expect(matchGlob('index.?*.ts', 'index.routing.ts')).toBe(true);
    });

    it('should require ? to match at least one char in combo', () => {
      expect(matchGlob('index.?*.ts', 'index.a.ts')).toBe(true);
    });

    it('should not match when ? cannot be satisfied in combo', () => {
      expect(matchGlob('index.?*.ts', 'index..ts')).toBe(false);
    });

    it('should not match when ? part is missing', () => {
      expect(matchGlob('index.?*.ts', 'index.ts')).toBe(false);
    });
  });

  describe('special regex characters', () => {
    it('should handle dots literally', () => {
      expect(matchGlob('index.ts', 'indexXts')).toBe(false);
    });

    it('should handle parentheses literally', () => {
      expect(matchGlob('file(1).ts', 'file(1).ts')).toBe(true);
    });

    it('should handle square brackets literally', () => {
      expect(matchGlob('file[0].ts', 'file[0].ts')).toBe(true);
    });

    it('should handle curly braces literally', () => {
      expect(matchGlob('file{a}.ts', 'file{a}.ts')).toBe(true);
    });

    it('should handle plus sign literally', () => {
      expect(matchGlob('file+.ts', 'file+.ts')).toBe(true);
    });

    it('should handle caret literally', () => {
      expect(matchGlob('^file.ts', '^file.ts')).toBe(true);
    });

    it('should handle dollar sign literally', () => {
      expect(matchGlob('file$.ts', 'file$.ts')).toBe(true);
    });

    it('should handle pipe literally', () => {
      expect(matchGlob('file|other.ts', 'file|other.ts')).toBe(true);
    });

    it('should handle backslash literally', () => {
      expect(matchGlob('file\\.ts', 'file\\.ts')).toBe(true);
    });
  });

  describe('real-world barrel file patterns', () => {
    it('should match index.ts with exact name', () => {
      expect(matchGlob('index.ts', 'index.ts')).toBe(true);
    });

    it('should match index.routing.ts with glob', () => {
      expect(matchGlob('index.*.ts', 'index.routing.ts')).toBe(true);
    });

    it('should match index.state.ts with glob', () => {
      expect(matchGlob('index.*.ts', 'index.state.ts')).toBe(true);
    });

    it('should not match non-index files with index glob', () => {
      expect(matchGlob('index.*.ts', 'main.routing.ts')).toBe(false);
    });

    it('should not match index.ts with index.*.ts (requires at least one char after dot)', () => {
      expect(matchGlob('index.*.ts', 'index..ts')).toBe(true);
    });

    it('should match public-api.ts with public-*.ts', () => {
      expect(matchGlob('public-*.ts', 'public-api.ts')).toBe(true);
    });

    it('should match barrel.ts exactly', () => {
      expect(matchGlob('barrel.ts', 'barrel.ts')).toBe(true);
    });

    it('should not match non-ts file with ts glob', () => {
      expect(matchGlob('*.ts', 'file.js')).toBe(false);
    });
  });
});
