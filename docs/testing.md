---
id: testing
title: Testing
sidebar_position: 12
---

# Testing

a2a-gateway has three layers of testing: unit tests, Go E2E tests, and shell-based integration test suites.

## Unit tests

### Run all unit tests

```bash
go test ./... -race -timeout 60s
```

Or via Make:

```bash
make test
```

### What's tested

- `internal/config/` — YAML loading, validation, defaults
- `internal/gateway/` — Executor logic, router, content guard
- `internal/adapter/acp/` — ACP protocol codec and state machine
- `internal/evidence/` — File writing and retention sweep
- `internal/push/` — SQLite push store CRUD
- `internal/taskstore/` — SQLite task store queries

### Race detector

All tests run with `-race` to detect data races. Do not disable the race detector.

---

## E2E tests (Go)

The `e2e/` package contains Go-based end-to-end tests. They launch the real gateway binary against a stub backend.

### Run E2E tests

```bash
go test ./e2e/... -race -timeout 120s
```

### Stub server

`e2e/stub/stub.go` implements a minimal ACP/A2A stub server. It responds to method calls with configurable canned responses. The stub makes it possible to test gateway behaviour without a real LLM.

### What E2E tests cover

- Full A2A request/response round trips
- Streaming SSE event delivery
- `GetTask` / `ListTasks` / `CancelTask`
- Push notification webhook delivery
- Auth failure (401) for bearer mode
- Rate limiting (429)
- Health check (`/healthz`)

---

## Shell integration test suites

The `scripts/` directory contains shell-based test suites. These scripts start real gateway processes and make real HTTP calls.

### Run all shell suites

```bash
bash scripts/test-all.sh
```

`test-all.sh` runs 18 suites sequentially. A summary is printed at the end. Exit code is 0 only when all suites pass.

### Suite list

| Suite script | What it tests |
|---|---|
| `scripts/test-core.sh` | Basic send, get, list, cancel |
| `scripts/test-streaming.sh` | SSE streaming delivery |
| `scripts/test-auth.sh` | Bearer token accept/reject |
| `scripts/test-rate-limit.sh` | 429 behavior under burst |
| `scripts/test-tls.sh` | TLS listen and client cert |
| `scripts/test-http-backend.sh` | OpenAI-compatible backend (P2) |
| `scripts/test-a2a-chaining.sh` | A2A → A2A backend chaining (P2) |
| `scripts/test-evidence.sh` | Evidence file creation |
| `scripts/test-evidence-retention.sh` | Retention sweep |
| `scripts/test-extended-agent-card.sh` | Extended card endpoint (P2) |
| `scripts/test-push-retry.sh` | Push notification retry (P2) |
| `scripts/test-horizontal-scaling.sh` | Multi-replica shared SQLite (P2) |
| `scripts/test-healthz.sh` | Healthz response |
| `scripts/test-metrics.sh` | Prometheus counter increments |
| `scripts/test-tracing.sh` | OTel trace header propagation |
| `scripts/test-permissions.sh` | ACP permission allow/deny |
| `scripts/test-skills.sh` | Skill-based routing |
| `scripts/test-sighup.sh` | SIGHUP hot reload |

P2 suites do not require a real ACP backend — they use the stub.

### Running a single suite

```bash
bash scripts/test-core.sh
```

Each suite starts its own gateway process, runs tests, and cleans up.

### Port assignments

Each suite uses a unique port to avoid conflicts when suites are run in parallel. Port assignments are documented at the top of each script. Start ports are in the range 18000–18999 for shell suites.

---

## Testing checklist before merging

- [ ] `make ci` passes (fmt + vet + boundaries + unit tests)
- [ ] `go test ./e2e/... -race -timeout 120s` passes
- [ ] `bash scripts/test-all.sh` passes
- [ ] `govulncheck ./...` shows no new vulnerabilities

---

## Adding new tests

### New unit test

Create a `_test.go` file alongside the package under test. Follow existing patterns in `internal/`. Use table-driven tests where possible.

### New E2E test

Add a new `Test*` function in `e2e/`. Use the `stub` package to configure canned responses.

### New shell suite

Add a new `scripts/test-<feature>.sh` following the pattern of existing suites:

1. Start the gateway in the background
2. Send HTTP requests with `curl`
3. Assert responses with `grep` or `jq`
4. Clean up (kill gateway, remove temp files)
5. Register the new script in `scripts/test-all.sh`
