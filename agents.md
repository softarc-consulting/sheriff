YOU MUST FOLLOW the instructions in this document

# General guidelines
- Before starting a Task do a thorough planning and break down the task in small sub-tasks 
- Use conventional commits. The allowed scopes and types are listed in `./CONTRIBUTING.md#scope` and `./CONTRIBUTING.md#type`
- Write atomic commits
- Before finishing a task make sure that `yarn lint:all`, `yarn test` and `yarn build:all` pass as well as the integration tests when running `run-integration-tests.sh`. To run a single test file use `yarn vitest run -t "<test name>"`
- Sheriff follows a zero-dependencies policy which means that adding a third-party package should be avoided at all costs.

# Project Overview
Sheriff is a TypeScript tool which enforces module boundaries and dependency rules. For more information you can read the documentation in `./docs`.

## Important Packages
- `packages/core`: This is the most important package where all the logic as well as the CLI tool lives
- `packages/eslint-plugin`: ESLint Plugin using the core packages
- `test-projects`: Test projects with different setups to make sure that Sheriff works as expected. Some of the setups are covered automatically with integration tests (`integration-test.sh`)

# Implementing new features
- Actual Implementation
- Check if documentation needs to be updated/added
- JSDoc for public members
- Unit Tests (100%)
- Integration Tests

# Bug Fixes

First reproduce the bug via a unit test. Once that is done, fix it in the code itself.
