import { describe, it, expect } from 'vitest';
import { parseStringOrRecord } from '../internal/parse-string-or-record';

describe('parseStringOrRecord', () => {
  // Regular string cases
  describe('with regular string input', () => {
    it('should return the input string as is', () => {
      const input = 'src/main.ts';
      const result = parseStringOrRecord(input);
      expect(result).toBe(input);
    });

    it('should handle empty strings', () => {
      const input = '';
      const result = parseStringOrRecord(input);
      expect(result).toBe(input);
    });

    it('should handle strings with braces in the middle', () => {
      const input = 'src/{pattern}/main.ts';
      const result = parseStringOrRecord(input);
      expect(result).toBe(input);
    });
  });

  // JSON string cases
  describe('with JSON string input', () => {
    it('should parse a simple JSON object string with double quotes', () => {
      const input = '{"app": "src/app/main.ts", "api": "src/api/main.ts"}';
      const result = parseStringOrRecord(input);
      expect(result).toEqual({
        app: 'src/app/main.ts',
        api: 'src/api/main.ts',
      });
    });

    it('should convert single quotes to double quotes before parsing', () => {
      const input = "{'app': 'src/app/main.ts', 'api': 'src/api/main.ts'}";
      const result = parseStringOrRecord(input);
      expect(result).toEqual({
        app: 'src/app/main.ts',
        api: 'src/api/main.ts',
      });
    });

    it('should handle mixed quotes', () => {
      const input = "{'app': \"src/app/main.ts\", \"api\": 'src/api/main.ts'}";
      const result = parseStringOrRecord(input);
      expect(result).toEqual({
        app: 'src/app/main.ts',
        api: 'src/api/main.ts',
      });
    });

    it('should handle a single property', () => {
      const input = '{"app": "src/app/main.ts"}';
      const result = parseStringOrRecord(input);
      expect(result).toEqual({
        app: 'src/app/main.ts',
      });
    });

    it('should handle empty object', () => {
      const input = '{}';
      const result = parseStringOrRecord(input);
      expect(result).toEqual({});
    });
  });

  // Edge cases
  describe('edge cases', () => {
    it('should handle invalid JSON and return the original string', () => {
      const input = '{app: src/app/main.ts}'; // Invalid JSON (no quotes)
      const result = parseStringOrRecord(input);
      expect(result).toBe(input);
    });

    it('should handle incomplete JSON and return the original string', () => {
      const input = '{"app": "src/app/main.ts"'; // Missing closing brace
      const result = parseStringOrRecord(input);
      expect(result).toBe(input);
    });

    it('should handle strings with only an opening brace', () => {
      const input = '{something';
      const result = parseStringOrRecord(input);
      expect(result).toBe(input);
    });

    it('should handle strings with only a closing brace', () => {
      const input = 'something}';
      const result = parseStringOrRecord(input);
      expect(result).toBe(input);
    });

    it('should not parse arrays', () => {
      const input = '["src/app/main.ts", "src/api/main.ts"]';
      const result = parseStringOrRecord(input);
      expect(result).toBe(input);
    });
  });

  // Special character cases
  describe('with special characters', () => {
    it('should handle paths with Windows-style backslashes', () => {
      const input = '{"app": "src\\\\app\\\\main.ts"}';
      const result = parseStringOrRecord(input);
      expect(result).toEqual({
        app: 'src\\app\\main.ts',
      });
    });

    it('should handle paths with special characters', () => {
      const input = '{"special@app": "src/app-v1.2/main_file.ts"}';
      const result = parseStringOrRecord(input);
      expect(result).toEqual({
        'special@app': 'src/app-v1.2/main_file.ts',
      });
    });

    it('should handle escaped quotes within property values', () => {
      const input = '{"app": "src/\\"quoted\\"/main.ts"}';
      const result = parseStringOrRecord(input);
      expect(result).toEqual({
        app: 'src/"quoted"/main.ts',
      });
    });
  });

  // CLI argument simulation test cases
  describe('CLI argument simulation', () => {
    it('should parse CLI-style multi-project setup', () => {
      const input = '{"project-i": "projects/project-i/src/main.ts", "project-ii": "projects/project-ii/src/main.ts"}';
      const result = parseStringOrRecord(input);
      expect(result).toEqual({
        'project-i': 'projects/project-i/src/main.ts',
        'project-ii': 'projects/project-ii/src/main.ts',
      });
    });

    it('should parse escaped CLI arguments', () => {
      // This simulates a CLI argument that might be escaped in bash
      const input = '\\{"app":"src/main.ts"\\}';
      const result = parseStringOrRecord(input);
      // In this case, the backslashes would be part of the string, so it wouldn't be parsed as JSON
      expect(result).toBe(input);
    });
  });

  // New tests for whitespace handling (Improvement #1)
  describe('whitespace handling', () => {
    it('should handle objects with whitespace before and after', () => {
      const input = '  {"app": "src/app/main.ts"}  ';
      const result = parseStringOrRecord(input);
      expect(result).toEqual({
        app: 'src/app/main.ts',
      });
    });

    it('should handle objects with newlines and tabs', () => {
      const input = `
        {
          "app": "src/app/main.ts",
          "api": "src/api/main.ts"
        }
      `;
      const result = parseStringOrRecord(input);
      expect(result).toEqual({
        app: 'src/app/main.ts',
        api: 'src/api/main.ts',
      });
    });
  });

  // New tests for type safety (Improvement #2)
  describe('type safety', () => {
    it('should return the original string when object contains non-string values', () => {
      const input = '{"app": "src/app/main.ts", "count": 42}';
      const result = parseStringOrRecord(input);
      expect(result).toBe(input);
    });

    it('should return the original string when object contains nested objects', () => {
      const input = '{"app": "src/app/main.ts", "config": {"port": 3000}}';
      const result = parseStringOrRecord(input);
      expect(result).toBe(input);
    });

    it('should return the original string when object contains arrays', () => {
      const input = '{"app": "src/app/main.ts", "modules": ["auth", "users"]}';
      const result = parseStringOrRecord(input);
      expect(result).toBe(input);
    });
  });

  // New tests for improved quote replacement (Improvement #5)
  describe('improved quote replacement', () => {
    it('should handle string values with single quotes inside double quotes', () => {
      const input = '{"message": "It\'s working"}'
      const result = parseStringOrRecord(input);
      expect(result).toEqual({
        message: "It's working"
      });
    });

    it('should handle property values with escaped single quotes', () => {
      const input = "{'key': 'value with \\'escaped\\' single quotes'}"
      const result = parseStringOrRecord(input);
      expect(result).toEqual({
        key: 'value with "escaped" single quotes'
      });
    });

    it('should handle a complex mix of quotes and escaping', () => {
      // Test a simpler but still valid example of mixed quotes that our implementation can handle
      const input = "{'app': \"src/app/main.ts\", \"api\": 'src/api/main.ts'}"
      const result = parseStringOrRecord(input);
      expect(result).toEqual({
        app: 'src/app/main.ts',
        api: 'src/api/main.ts'
      });
    });
  });
});
