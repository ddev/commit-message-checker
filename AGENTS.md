# Agent guidelines

This GitHub Action checks commit messages against a regex pattern. It is written
in TypeScript and bundled to JavaScript via Rollup; both source and bundle are
committed.

`CLAUDE.md` and `.github/copilot-instructions.md` are symlinks to this file so
Claude Code and GitHub Copilot pick up the same guidance.

## Repository layout

| Path                | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `src/`              | TypeScript source.                                     |
| `dist/`             | Generated JavaScript bundle (committed; do not edit).  |
| `__fixtures__/`     | Jest mocks for `@actions/core` and `@actions/github`.  |
| `__tests__/`        | Unit tests.                                            |
| `local-action/`     | `@github/local-action` env and event payload examples. |
| `.ddev/`            | DDEV configuration (Node pinned via `.node-version`).  |
| `.github/`          | Workflows and issue templates.                         |
| `action.yml`        | GitHub Action metadata and inputs.                     |
| `eslint.config.mjs` | ESLint flat config.                                    |
| `jest.config.js`    | Jest config (ESM via ts-jest).                         |
| `rollup.config.ts`  | Rollup bundler config.                                 |
| `tsconfig.json`     | TypeScript config.                                     |
| `.prettierrc.yml`   | Prettier config.                                       |
| `.node-version`     | Pinned Node version.                                   |

## Development environment

All Node tooling runs inside the DDEV web container. Use `ddev npm` and
`ddev exec node`/`npx` — never the host binaries. Node version is pinned via
`.node-version` and surfaced into the container by `nodejs_version: auto` in
`.ddev/config.yaml`.

```sh
ddev start
ddev npm install
```

## Scripts

| Script         | Purpose                                                   |
| -------------- | --------------------------------------------------------- |
| `format:write` | Prettier across the repo.                                 |
| `format:check` | Prettier in check mode (CI).                              |
| `lint`         | ESLint over the repo.                                     |
| `test`         | Jest in ESM mode (`--experimental-vm-modules`).           |
| `package`      | Bundle `src/index.ts` → `dist/index.js` via Rollup.       |
| `local-action` | Run the action locally against `local-action/.env`.       |
| `all`          | `format:write` → `lint` → `test` → `package`. Matches CI. |

Invoke any of these as `ddev npm run <script>`.

## Source layout

- `src/index.ts` — entry point; calls `run()` from `main.ts`.
- `src/main.ts` — top-level error boundary around the action's flow.
- `src/input-helper.ts` — reads action inputs and builds the list of messages
  from the GitHub event payload (`push`, `pull_request`, `pull_request_target`).
- `src/commit-message-checker.ts` — runs the regex against each message.

## Coding guidelines

- TypeScript strict mode is on (`tsconfig.json`). Don't loosen it.
- Use `@actions/core` for logging (`core.info`, `core.debug`, `core.warning`) —
  not `console`.
- Use `core.setFailed(err)` for failures. `@actions/core` v3 accepts both
  `string` and `Error`.
- Keep source modules tightly scoped; resist the urge to refactor unrelated code
  while fixing a bug.
- Preserve the source-file header notices in every file under `src/`.

## Tests

- Tests live in `__tests__/*.test.ts`. Use `jest.unstable_mockModule` to mock
  ESM modules; mock implementations live in `__fixtures__/`.
- Cover passing and failing regex paths plus error conditions (missing inputs,
  malformed payloads).

## Bundling

The action runs `dist/index.js` directly on the GitHub runner, so any change
under `src/` must be followed by `ddev npm run package` (or `ddev npm run all`),
and the regenerated `dist/index.js` plus `dist/index.js.map` must be committed.
CI fails if `dist/` is dirty after a rebuild.

## Versioning and releases

Versioned via tags and the major-version branch (`v3`). Update `package.json`
`version` when shipping. Consumers pin via `ddev/commit-message-checker@v3`.

## PR checklist

- `ddev npm run all` is clean (format, lint, test, build).
- `dist/` is regenerated and committed if anything under `src/` changed.
- Behavior or input changes are reflected in `README.md` and `action.yml`.
