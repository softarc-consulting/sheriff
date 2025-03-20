# Contributing to Sheriff

We would love you to contribute to Sheriff.
As a contributor, here are the guidelines we would like you to follow:

- [Developing](./DEVELOPMENT.md)
- [Issues and Bugs](#issue)
- [Feature Requests](#feature)
- [Coding Rules](#rules)

## <a name="issue"></a> Found a Bug?

If you find a bug in the source code, you can help us by submitting an issue to our [GitHub Repository](https://github.com/softarc-consulting/sheriff).
Even better, you can submit a Pull Request with a fix.

When you are opening a new issue, it would be very appreciated and helpful for us if you could provide a minimal reproducible example. To do so you can 
use our [stackblitz starter](https://stackblitz.com/github/softarc-consulting/sheriff-stackblitz-starter).

## <a name="feature"></a> Missing a Feature?

You can _request_ a new feature by submitting an issue to our GitHub Repository.
If you would like to _implement_ a new feature, please consider the size of the change in order to determine the right steps to proceed:

- For a **Major Feature**, first open an issue and outline your proposal so that it can be discussed.
  This process allows us to better coordinate our efforts, prevent duplication of work, and help you to craft the change so that it is successfully accepted into the project.

  **Note**: Adding a new topic to the documentation, or significantly re-writing a topic, counts as a major feature.

- **Small Features** can be crafted and directly submitted as a Pull Request.

## <a name="commit"></a> Commit Message Format
We are using the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for our commit messages.

Each commit message consists of a **header**, a **body**, and a **footer**.

```
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The `header` is mandatory and must conform to the [Commit Message Header](#commit-header) format.

The `body` is optional.

The `footer` is optional.

Any line of the commit message should not be longer than 100 characters.

#### <a name="commit-header"></a>Commit Message Header

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: core | eslint-plugin | docs | test-projects
  │
  └─⫸ Commit Type: build | chore | ci | docs | feat | fix | perf | refactor | revert | style | test
```

The `<type>` and `<summary>` fields are mandatory, the `(<scope>)` field is optional.

##### Type

Must be one of the following:

- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Catch-all type for any changes that do not fit into the other types
- **docs**: Documentation only changes
- **feat**: A new feature
- **fix**: A bug fix
- **perf**: A code change that improves performance
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **revert**: Reverts a previous commit
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **test**: Adding missing tests or correcting existing tests





##### Scope

The scope describes a section of the code base that the commit affects.

We do have the following scopes:

- `core`: commit affecting the `core` package
- `eslint-plugin`: commit affecting the `eslint-plugin` package
- `docs`: commit affecting documentation
- `test-projects`: commit affecting `test-projects`
