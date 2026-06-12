---
id: configuration
title: Configuration
sidebar_position: 4
---

# Configuration

a2a-gateway is configured via a single YAML file. Pass it with `--config <path>` or use `--agent <name>` to load `agents/<name>.yaml`.

For the complete field-by-field reference see [Configuration Reference](./reference/configuration-reference.md).

## Minimal example (ACP backend)

```yaml
gateway:
  id: "my-gateway"
  listen_addr: "127.0.0.1:8081"
  evidence_dir: ".evidence"

a2a:
  public_url: "http://127.0.0.1:8081"
  auth:
    mode: "none"

backend:
  type: "acp"
  cwd: "."
  acp:
    transport: "stdio-spawn"
    executable: "copilot"
    args: ["--acp", "--stdio"]

permissions:
  default_action: "allow"

task:
  timeout: "5m"
```

## Backend types

### `acp` — ACP executable backend

Drives any ACP-compatible executable over JSON-RPC.

```yaml
backend:
  type: "acp"
  cwd: "/workspace"
  acp:
    transport: "stdio-spawn"      # stdio-spawn | tcp-connect | tcp-spawn
    executable: "my-acp-tool"
    args: ["--acp", "--stdio"]
```

**Transport modes:**

| Mode | Behavior |
|---|---|
| `stdio-spawn` | Gateway spawns the executable; communicates over stdin/stdout |
| `tcp-connect` | Gateway connects to an already-running ACP TCP server |
| `tcp-spawn` | Gateway spawns the executable in TCP mode; waits for port readiness |

```yaml
# tcp-connect example
backend:
  type: "acp"
  acp:
    transport: "tcp-connect"
    tcp:
      host: "127.0.0.1"
      port: 3001
      startup_timeout: "10s"
```

```yaml
# tcp-spawn example
backend:
  type: "acp"
  acp:
    transport: "tcp-spawn"
    executable: "my-acp-tool"
    args: ["--acp", "--port", "{{.Port}}"]
    tcp:
      host: "127.0.0.1"
      port: 3001
      startup_timeout: "10s"
```

`{{.Port}}` is replaced with the configured port at startup.

### `http` — OpenAI-compatible HTTP backend

Forwards tasks to any OpenAI-compatible LLM endpoint.

```yaml
backend:
  type: "http"
  http:
    url: "https://api.openai.com/v1"
    api_key_env: "OPENAI_API_KEY"    # env var name (not the key itself)
    model: "gpt-4o"
    system_prompt: "You are a helpful assistant."
    max_tokens: 4096
    streaming_enabled: true          # default true
    timeout: "120s"
```

The API key is never written to the config file — only the environment variable name.

### `a2a` — Downstream A2A backend

Chains to another A2A gateway or agent.

```yaml
backend:
  type: "a2a"
  a2a:
    url: "http://gateway-b:8082"
    bearer_token_env: "DOWNSTREAM_TOKEN"   # optional; name of env var
    timeout: "5m"
```

## Authentication

### Disable auth (development/localhost only)

```yaml
a2a:
  auth:
    mode: "none"
```

### Enable bearer token auth

```yaml
a2a:
  auth:
    mode: "bearer"
    bearer_token_env: "A2A_GATEWAY_TOKEN"
```

Then:

```bash
export A2A_GATEWAY_TOKEN="my-secret-token"
./bin/a2a-gateway serve --config myconfig.yaml
```

Requests must include: `Authorization: Bearer my-secret-token`

## TLS

```yaml
gateway:
  tls:
    cert_file: "/path/to/server.crt"
    key_file: "/path/to/server.key"
    min_version: "1.2"    # "1.2" (default) or "1.3"
```

## Rate limiting

Per-caller token-bucket rate limiter.

```yaml
gateway:
  rate_limit:
    enabled: true
    requests_per_second: 10.0
    burst_size: 20
```

## Task persistence (SQLite)

By default, tasks are stored in-memory (lost on restart). Enable SQLite persistence:

```yaml
task:
  store_path: "/data/gateway.db"
  timeout: "5m"
```

When `store_path` is set, the gateway also creates `gateway.db.push` (push notification configs) and `gateway.db.perm` (permission pause states) in the same directory.

## Push notification retry

```yaml
push:
  max_retries: 3
  initial_backoff: "500ms"
  max_backoff: "30s"
```

## Skills

Skills are advertised in the agent card and can optionally route to different ACP backends.

```yaml
gateway:
  skills:
    - id: "code-review"
      name: "Code Review"
      description: "Reviews code for correctness and style"
      tags: ["code", "review"]
      examples:
        - "Review this Go function for correctness"
      acp:                          # optional: override top-level backend for this skill
        transport: "stdio-spawn"
        executable: "my-reviewer-tool"
        args: ["--acp", "--stdio"]
```

## Evidence retention

Automatically clean up old evidence directories:

```yaml
gateway:
  evidence_retention:
    max_age: "7d"          # delete entries older than 7 days
    max_size_mb: 500       # delete oldest entries when dir exceeds 500 MB
    check_interval: "1h"   # how often to run the cleanup (default: 1h)
```

## Metrics (Prometheus)

```yaml
metrics:
  enabled: true
  addr: ":9090"             # metrics server listen address
```

Access at `http://host:9090/metrics`.

## Tracing (OpenTelemetry)

```yaml
tracing:
  enabled: true
  endpoint: "localhost:4317"    # OTLP gRPC receiver
  service_name: "a2a-gateway"
```

## Logging

```yaml
log:
  level: "info"    # trace | debug | info | warn | error
```

Override at runtime without config change: `LOG_LEVEL=debug ./bin/a2a-gateway serve ...`

## Config validation

```bash
./bin/a2a-gateway config validate --config myconfig.yaml
```

## Hot reload (SIGHUP)

Send `SIGHUP` to the running gateway process to reload the config without restarting:

```bash
kill -HUP $(pgrep a2a-gateway)
```

Log level and rate-limit settings reload atomically. Backend configuration is not hot-reloaded (a restart is required to change backends).
