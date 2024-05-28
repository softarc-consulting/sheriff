#!/usr/bin/env node

/**
 * All processing, except accessing the arguments from CLI
 * is done by `main()`.
 *
 * This is due to better testability.
 */

/** TODO
 * - Global Error Handling in for User Errors and System Errors
 * - Add documentation
 * - Add integration tests
 * - Add json export of AssignedFileInfoMap
 */

import { main } from '../lib/cli/main';

main.apply(this, process.argv.slice(2));
