---
id: development
title: Development
sidebar_position: 11
---

# Development

## Prerequisites

- Go 1.25.11 or later
- `make` (GNU Make)
- `golangci-lint` (for linting)
- `govulncheck` (for security scanning)

## Repository layout

```
a2a-gateway/
  cmd/a2a-gateway/    CLI entry point
  internal/           All implementation code (private)
  e2e/                End-to-end test suite
  scripts/            Shell-based integration test suites
  agents/             Example YAML config files
  docs/               Developer docs (this folder)
  website/            Docusaurus documentation site
  Makefile            All build and test targets
```

## Common commands

```bash
# Build the binary to bin/a2a-gateway
make build

# Run all unit tests with race detector
make test

# Format code
make fmt

# Run go vet
make vet

# Validate config schema
make config-validate

# Check package boundary rules
make check-boundaries

# Run full local CI (fmt + vet + boundaries + test)
make ci

# Install binary to $GOPATH/bin
make install
```

## Full local CI

Run `make ci` before every commit. This runs:

1. `make fmt` — formats all Go files
2. `make vet` — runs `go vet ./...`
3. `make check-boundaries` — enforces import boundary rules
4. `make test` — runs `go test ./... -race -timeout 60s`

If `make ci` passes, the GitHub Actions CI will pass.

## Package boundary checks

The project enforces strict import boundaries between packages. The rule is that `adapter/acp` must be an isolated adapter with no dependencies on internal business logic packages, and `gateway` must never directly import `backend/acp`.

Run `make check-boundaries` to verify:

```bash
make check-boundaries
# Checking import boundaries...
# OK
```

If there are violations, the command exits non-zero and lists the offending imports.

The same check runs in CI as the `boundary-check` job.

See [Architecture](./architecture.md#package-import-rules) for the full import rules table.

## Adding a new backend type

1. Create a new package under `internal/backend/<name>/`
2. Implement the `backend.Backend` interface
3. Add a new case to `internal/backend/builder.go` (or equivalent)
4. Add config struct to `internal/config/`
5. Write unit tests with a mock event stream

The `backend.Backend` interface is the single integration point — the gateway package does not need to change.

## Adding a new CLI subcommand

1. Create a new command file under `cmd/a2a-gateway/`
2. Register it in `cmd/a2a-gateway/root.go`
3. Wire any needed `internal/` packages via `internal/app/`

## Config validation

The config schema validates all required fields on startup. During development, use `validate` to check before running:

```bash
./bin/a2a-gateway validate --config myconfig.yaml
```

Or via Make:

```bash
make config-validate
```

## Linting

```bash
golangci-lint run
```

The `.golangci.yml` file in the repo root defines enabled linters. All linters must pass before merging.

## Security scanning

```bash
govulncheck ./...
```

This scans for known vulnerabilities in the dependency tree. Runs as the `security-scan` job in CI.

## Dependency management

```bash
# Add a new dependency
go get github.com/example/package

# Remove unused dependencies
go mod tidy

# Verify module checksums
go mod verify
```

## CI jobs

Three jobs run on every push to `main` and on all pull requests:

| Job | Commands |
|---|---|
| `build-and-test` | `go build ./...`, `go test ./... -race` |
| `boundary-check` | `make check-boundaries` |
| `security-scan` | `govulncheck ./...` |

All three must pass before merging.

## Working with the A2A SDK

The SDK (`github.com/a2aproject/a2a-go/v2`) provides:

- `a2asrv.NewJSONRPCHandler` — HTTP handler for all A2A methods
- `a2asrv.AgentExecutor` — interface that `gateway.Executor` implements
- `a2asrv.ExecutorContext` — context passed to the executor with task history
- `a2aclient.NewClient` — client for making A2A calls (used by `backend/a2a`)
- `a2a.TaskStatusUpdateEvent`, `a2a.TaskArtifactUpdateEvent` — event types

When the SDK is upgraded, re-run all tests to verify compatibility.

## Editor setup

Recommended VS Code extensions:
- `golang.go` — Go language support
- `redhat.vscode-yaml` — YAML config validation

The project uses Go workspace mode is **not** required; a plain `go mod` module at the root is sufficient.
