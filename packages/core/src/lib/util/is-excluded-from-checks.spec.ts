import { describe, it, expect } from 'vitest';
import { toFsPath } from '../file-info/fs-path';
import { isExcludedFromChecks } from './is-excluded-from-checks';

describe('isExcludedFromChecks', () => {
  describe('with string patterns', () => {
    it('should return false when no patterns are provided', () => {
      const filePath = toFsPath('src/app/component.ts');
      expect(isExcludedFromChecks(filePath, [])).toBe(false);
    });

    it('should match exact path patterns', () => {
      const filePath = toFsPath('src/app/component.ts');
      expect(isExcludedFromChecks(filePath, ['src/app/component.ts'])).toBe(true);
    });

    it('should match path ending patterns', () => {
      const filePath = toFsPath('src/app/component.ts');
      expect(isExcludedFromChecks(filePath, ['component.ts'])).toBe(true);
      expect(isExcludedFromChecks(filePath, ['app/component.ts'])).toBe(true);
    });

    it('should handle glob patterns with single asterisk', () => {
      const filePath = toFsPath('src/app/component.ts');
      expect(isExcludedFromChecks(filePath, ['src/app/*.ts'])).toBe(true);
      expect(isExcludedFromChecks(filePath, ['src/*/component.ts'])).toBe(true);
      expect(isExcludedFromChecks(filePath, ['src/*/*.ts'])).toBe(true);
    });

    it('should handle glob patterns with double asterisk', () => {
      const filePath = toFsPath('src/app/feature/component.ts');
      expect(isExcludedFromChecks(filePath, ['src/**/*.ts'])).toBe(true);
      expect(isExcludedFromChecks(filePath, ['src/app/**'])).toBe(true);
      expect(isExcludedFromChecks(filePath, ['**/component.ts'])).toBe(true);
    });

    it('should handle complex glob patterns', () => {
      const filePath = toFsPath('src/app/feature/component.ts');
      expect(isExcludedFromChecks(filePath, ['src/app/feat*/**/*.ts'])).toBe(true);
      expect(isExcludedFromChecks(filePath, ['src/**/feat*/**/*.ts'])).toBe(true);
    });

    it('should not match unrelated patterns', () => {
      const filePath = toFsPath('src/app/component.ts');
      expect(isExcludedFromChecks(filePath, ['src/lib/**'])).toBe(false);
      expect(isExcludedFromChecks(filePath, ['**/*.spec.ts'])).toBe(false);
      expect(isExcludedFromChecks(filePath, ['dist/**'])).toBe(false);
    });
  });

  describe('with regex patterns', () => {
    it('should match regex patterns', () => {
      const filePath = toFsPath('src/app/component.ts');
      expect(isExcludedFromChecks(filePath, [/\.ts$/])).toBe(true);
      expect(isExcludedFromChecks(filePath, [/src\/.*\.ts$/])).toBe(true);
      expect(isExcludedFromChecks(filePath, [/.*component.*/])).toBe(true);
    });

    it('should handle complex regex patterns', () => {
      const filePath = toFsPath('src/app/feature/component.ts');
      expect(isExcludedFromChecks(filePath, [/src\/.*\/.*\/.*\.ts$/])).toBe(true);
      expect(isExcludedFromChecks(filePath, [/.*feature.*/])).toBe(true);
    });

    it('should not match unrelated regex patterns', () => {
      const filePath = toFsPath('src/app/component.ts');
      expect(isExcludedFromChecks(filePath, [/\.spec\.ts$/])).toBe(false);
      expect(isExcludedFromChecks(filePath, [/dist\//])).toBe(false);
    });
  });

  describe('with mixed patterns', () => {
    it('should match any pattern in the array', () => {
      const filePath = toFsPath('src/app/component.ts');
      expect(isExcludedFromChecks(filePath, [
        'src/lib/**',
        'src/app/**',
        /\.spec\.ts$/
      ])).toBe(true);
    });

    it('should handle empty patterns array', () => {
      const filePath = toFsPath('src/app/component.ts');
      expect(isExcludedFromChecks(filePath, [])).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle root paths', () => {
      const filePath = toFsPath('component.ts');
      expect(isExcludedFromChecks(filePath, ['*.ts'])).toBe(true);
      expect(isExcludedFromChecks(filePath, ['**/*.ts'])).toBe(true);
    });

    it('should handle paths with special characters', () => {
      const filePath = toFsPath('src/app/feature-name/component.ts');
      expect(isExcludedFromChecks(filePath, ['src/**/feature-*/**'])).toBe(true);
      expect(isExcludedFromChecks(filePath, [/feature-.*/])).toBe(true);
    });

    it('should handle Windows-style paths', () => {
      const filePath = toFsPath('src\\app\\component.ts');
      expect(isExcludedFromChecks(filePath, ['src/app/**'])).toBe(true);
      expect(isExcludedFromChecks(filePath, ['src/**/*.ts'])).toBe(true);
    });
  });

  describe('glob pattern conversion', () => {
    it('should convert single asterisk correctly', () => {
      const filePath = toFsPath('src/app/component.ts');
      expect(isExcludedFromChecks(filePath, ['src/*/component.ts'])).toBe(true);
      expect(isExcludedFromChecks(filePath, ['src/app/*.ts'])).toBe(true);
    });

    it('should convert double asterisk correctly', () => {
      const filePath = toFsPath('src/app/feature/component.ts');
      expect(isExcludedFromChecks(filePath, ['src/**/*.ts'])).toBe(true);
      expect(isExcludedFromChecks(filePath, ['**/feature/**'])).toBe(true);
    });

    it('should escape regex special characters in glob patterns', () => {
      const filePath = toFsPath('src/app/component.ts');
      expect(isExcludedFromChecks(filePath, ['src/app/component.ts'])).toBe(true);
      expect(isExcludedFromChecks(filePath, ['src/app/component\\.ts'])).toBe(false);
    });
  });
});


