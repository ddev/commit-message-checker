# DDEV Commit Message Checker

![Version](https://img.shields.io/github/v/release/ddev/commit-message-checker?style=flat-square)
![Test](https://github.com/ddev/commit-message-checker/workflows/build-test/badge.svg)

A GitHub Action that checks commit messages against a regex pattern. Runs on
`push` and `pull_request` events; for pull requests it checks the title, body,
and optionally the commit messages themselves (title and body are concatenated
with two newlines).

<!-- prettier-ignore -->
> [!NOTE]
> Forked from the unmaintained
> [GsActions/commit-message-checker](https://github.com/GsActions/commit-message-checker).

## Usage

```yaml
name: 'Commit Message Check'
on:
  pull_request:
    types: [opened, edited, reopened, synchronize]
  pull_request_target:
    types: [opened, edited, reopened, synchronize]
  push:
    branches:
      - main
      - 'releases/*'

jobs:
  check-commit-message:
    name: Check Commit Message
    runs-on: ubuntu-latest
    steps:
      - name: Check Commit Type
        uses: ddev/commit-message-checker@v3
        with:
          pattern: '\[[^]]+\] .+$'
          flags: 'gm'
          error: 'Your first line has to contain a commit type like "[BUGFIX]".'

      - name: Check Line Length
        uses: ddev/commit-message-checker@v3
        with:
          pattern: '^[^#].{74}'
          error: 'The maximum line length of 74 characters is exceeded.'
          excludeTitle: 'true' # optional: skip the pull request title
          excludeDescription: 'true' # optional: skip the pull request body
          checkAllCommitMessages: 'true' # optional: check every commit on the PR
          accessToken: ${{ secrets.GITHUB_TOKEN }} # required when checkAllCommitMessages is true

      - name: Check for Resolves / Fixes
        uses: ddev/commit-message-checker@v3
        with:
          pattern: '^.+(Resolves|Fixes): \#[0-9]+$'
          error: 'You need at least one "Resolves|Fixes: #<issue number>" line.'
```

## Inputs

| Input                    | Required | Default | Description                                                                                |
| ------------------------ | -------- | ------- | ------------------------------------------------------------------------------------------ |
| `pattern`                | yes      | -       | Regex pattern the commit message must match. See [MDN RegExp][mdn-regexp].                 |
| `error`                  | yes      | -       | Error message reported when the pattern does not match.                                    |
| `flags`                  | no       | `gm`    | Regex flags. Any combination of `g`, `i`, `m`, `s`, `u`, `y`.                              |
| `excludeTitle`           | no       | `false` | If `true`, skip the pull request title.                                                    |
| `excludeDescription`     | no       | `false` | If `true`, skip the pull request body.                                                     |
| `checkAllCommitMessages` | no       | `false` | If `true`, check every commit attached to the pull request (requires `accessToken`).       |
| `accessToken`            | no       | -       | `GITHUB_TOKEN` used to fetch pull request commits. Required when `checkAllCommitMessages`. |

[mdn-regexp]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp

## Troubleshooting

Most questions about this action are about visibility, not bugs. Start by
[enabling debug logging][debug-logging] for the workflow - add the
`ACTIONS_STEP_DEBUG` and `ACTIONS_RUNNER_DEBUG` repository secrets, set both to
`true`, and re-run. The action will log each input, the resolved messages, and
the regex evaluation.

For iterating on patterns, <https://regexr.com/> matches this action's runtime
behavior closely.

[debug-logging]:
  https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging

## Development

All Node tooling runs inside the [DDEV](https://ddev.com/) web container, which
pins the Node version via `.ddev/config.yaml` (currently Node 24). Use
`ddev npm` / `ddev exec node` so builds don't depend on the host toolchain.

### Setup

```sh
git clone https://github.com/ddev/commit-message-checker.git
cd commit-message-checker
ddev start
ddev npm install
ddev npm run all
```

### Scripts

| Script         | What it does                                                         |
| -------------- | -------------------------------------------------------------------- |
| `format:write` | Run Prettier across the repo and fix formatting.                     |
| `format:check` | Run Prettier without writing - used in CI.                           |
| `lint`         | Run ESLint over the repo.                                            |
| `test`         | Run the Jest suite in ESM mode (`--experimental-vm-modules`).        |
| `package`      | Bundle `src/index.ts` → `dist/index.js` with Rollup. Commit `dist/`. |
| `local-action` | Run the action locally against `.env`. See below.                    |
| `all`          | `format:write` → `lint` → `test` → `package`. Same as CI.            |

Invoke any of these as `ddev npm run <script>`.

### Testing locally

[`@github/local-action`](https://github.com/github/local-action) stubs out the
GitHub Actions runtime so you can exercise `src/main.ts` without pushing a
branch. Everything it needs lives in `local-action/`:

- `local-action/.env.example` — template for action inputs (`INPUT_*`) and
  runtime env (`GITHUB_EVENT_NAME`, `GITHUB_EVENT_PATH`).
- `local-action/event.json.example` — webhook payload that `@actions/github`
  parses into `github.context.payload`. Ships a sample `push` with three commits
  (two passing, one failing). For pull request flows, set
  `GITHUB_EVENT_NAME=pull_request` in `.env` and replace `event.json` with a
  payload containing `pull_request` / `repository` keys.

```sh
ddev npm run local-action
# Edit local-action/.env or local-action/event.json and re-run to iterate.
```

The first run copies each `*.example` to its working filename if it isn't there
yet — both `local-action/.env` and `local-action/event.json` are gitignored, so
your edits stay local.

### Releasing

`dist/index.js` is what GitHub Actions executes, so it must be regenerated and
committed whenever runtime code changes. `ddev npm run all` rebuilds it; the
`build-test` workflow fails the PR if the committed bundle is stale.

## License

Released under the terms of the [MIT License](LICENSE).
