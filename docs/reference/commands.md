---
id: commands
title: Commands & Makefile Targets
sidebar_position: 1
---

# Commands & Makefile Targets

## CLI subcommands

The `a2a-gateway` binary has three subcommands.

### `serve`

Start the gateway server.

```
a2a-gateway serve [flags]
```

| Flag | Type | Default | Description |
|---|---|---|---|
| `--config` | string | — | Path to YAML config file (required unless `--agent` is used) |
| `--agent` | string | — | Load config from `agents/<name>.yaml` |

```bash
# Explicit config file
a2a-gateway serve --config /etc/a2a-gateway/gateway.yaml

# Agent shorthand (looks for agents/gateway-a.yaml)
a2a-gateway serve --agent gateway-a
```

### `validate`

Load and validate a config file without starting the server.

```
a2a-gateway validate [flags]
```

| Flag | Type | Default | Description |
|---|---|---|---|
| `--config` | string | — | Path to YAML config file |

```bash
a2a-gateway validate --config myconfig.yaml
# Config OK: myconfig.yaml
```

Exit code 0 = valid. Non-zero = validation error with message.

### `send`

Send a message to an A2A agent and print the response.

```
a2a-gateway send [flags]
```

| Flag | Type | Default | Description |
|---|---|---|---|
| `--to` | string | — | Base URL of the target A2A agent |
| `--message` | string | — | Message text to send |
| `--no-stream` | bool | false | Use blocking mode instead of SSE streaming |
| `--token` | string | — | Bearer token for auth |
| `--timeout` | duration | `60s` | Request timeout |

```bash
# Streaming (default)
a2a-gateway send --to http://127.0.0.1:8081 --message "Hello"

# Non-streaming
a2a-gateway send --to http://127.0.0.1:8081 --message "Hello" --no-stream

# With auth
a2a-gateway send --to http://gateway.example.com --message "Hello" --token "$TOKEN"
```

---

## Global flags

These flags apply to all subcommands.

| Flag | Description |
|---|---|
| `--help` | Show help |
| `--version` | Print version |

---

## Makefile targets

Run with `make <target>` from the repository root.

### Build

| Target | Description |
|---|---|
| `make build` | Build `./bin/a2a-gateway` |
| `make install` | Build and install to `$GOPATH/bin` |
| `make clean` | Remove `./bin/` |

### Test

| Target | Description |
|---|---|
| `make test` | `go test ./... -race -timeout 60s` |
| `make test-e2e` | `go test ./e2e/... -race -timeout 120s` |
| `make test-shell` | `bash scripts/test-all.sh` |

### Code quality

| Target | Description |
|---|---|
| `make fmt` | `gofmt -w ./...` |
| `make vet` | `go vet ./...` |
| `make lint` | `golangci-lint run` |
| `make check-boundaries` | Enforce package import rules |
| `make config-validate` | Validate `agents/*.yaml` config files |

### CI

| Target | Description |
|---|---|
| `make ci` | `fmt + vet + check-boundaries + test` (full local CI) |
| `make check` | `check-boundaries + vet + config-validate` |

### Security

| Target | Description |
|---|---|
| `make vuln` | `govulncheck ./...` |

### Cross-compilation (ACP-only)

These targets build the ACP executable (not the gateway). They are annotated in the Makefile as ACP-only targets.

| Target | Description |
|---|---|
| `make fake-acp` | Build fake ACP binary for testing |
| `make fake-acp-linux` | Cross-compile fake ACP for Linux/amd64 |

---

## Environment variables affecting CLI

| Variable | Used by | Description |
|---|---|---|
| `LOG_LEVEL` | `serve` | Override log level at startup |
| `A2A_GATEWAY_TOKEN` | `serve` | Bearer token value (referenced in config) |
| Any `*_env` value | `serve` | Any config field that ends in `_env` reads from this env var |
