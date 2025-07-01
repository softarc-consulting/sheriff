import { getEntriesFromCliOrConfig, Entry } from './get-entries-from-cli-or-config';
import { ProjectInfo } from '../../main/init';

// Test 1: runInit = false, should return Array<Entry<string>>
const stringEntries: Array<Entry<string>> = getEntriesFromCliOrConfig('src/main.ts', false);

// Test 2: runInit = true, should return Array<Entry<ProjectInfo>>
const projectInfoEntries1: Array<Entry<ProjectInfo>> = getEntriesFromCliOrConfig('src/main.ts', true);

// Test 3: runInit omitted (defaults to true), should return Array<Entry<ProjectInfo>>
const projectInfoEntries2: Array<Entry<ProjectInfo>> = getEntriesFromCliOrConfig('src/main.ts');

// These should cause TypeScript errors if the overloads are wrong:
// const wrong1: Array<Entry<string>> = getEntriesFromCliOrConfig('src/main.ts', true); // Should error
// const wrong2: Array<Entry<ProjectInfo>> = getEntriesFromCliOrConfig('src/main.ts', false); // Should error