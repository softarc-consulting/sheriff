#!/usr/bin/env node

/**
 * All processing, except accessing the arguments from CLI
 * is done by `main()`.
 *
 * This is due to better testability.
 */

import { main } from '../lib/cli/main';

main.apply(this, process.argv.slice(2));
