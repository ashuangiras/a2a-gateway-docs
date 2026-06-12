---
id: configuration-reference
title: Configuration Reference
sidebar_position: 2
---

# Configuration Reference

Full YAML field reference for the a2a-gateway config file.

## Complete example

```yaml
gateway:
  id: "my-gateway"
  listen_addr: "127.0.0.1:8081"
  evidence_dir: ".evidence"
  max_request_body_bytes: 4194304
  tls:
    cert_file: ""
    key_file: ""
    min_version: "1.2"
  rate_limit:
    enabled: false
    requests_per_second: 10.0
    burst_size: 20
  evidence_retention:
    max_age: "7d"
    max_size_mb: 500
    check_interval: "1h"

a2a:
  public_url: "http://127.0.0.1:8081"
  name: "a2a-gateway"
  description: ""
  version: "1.0.0"
  auth:
    mode: "none"
    bearer_token_env: ""
  skills: []
  default_input_modes:
    - "text/plain"
  default_output_modes:
    - "text/plain"

backend:
  type: "acp"
  acp:
    transport: "stdio-spawn"
    command: ""
    args: []
    env: {}
    cwd: ""
    tcp:
      host: "127.0.0.1"
      port: 9000
      startup_timeout: "10s"
  http:
    url: ""
    model: ""
    api_key_env: ""
    system_prompt: ""
    max_tokens: 4096
    timeout: "60s"
    streaming_enabled: true
  a2a:
    url: ""
    bearer_token_env: ""

task:
  store_path: ""
  timeout: "5m"

push:
  store_path: ""
  max_retries: 5
  initial_backoff: "1s"
  max_backoff: "60s"

permissions:
  default_action: "deny"
  allow_tools: []
  deny_tools: []
  allow_paths: []
  deny_paths: []

metrics:
  enabled: false
  addr: ":9090"

tracing:
  enabled: false
  endpoint: ""
  service_name: "a2a-gateway"

log:
  level: "info"
```

---

## Section: `gateway`

Top-level gateway settings.

| Field | Type | Default | Description |
|---|---|---|---|
| `id` | string | `"a2a-gateway"` | Instance identifier; included in logs and metrics |
| `listen_addr` | string | `"127.0.0.1:8081"` | TCP address to listen on |
| `evidence_dir` | string | `".evidence"` | Directory for per-task evidence files |
| `max_request_body_bytes` | int | `4194304` (4 MiB) | Max inbound request body size; requests exceeding this receive HTTP 413 |

### `gateway.tls`

| Field | Type | Default | Description |
|---|---|---|---|
| `cert_file` | string | `""` | Path to TLS certificate file (PEM); both must be set |
| `key_file` | string | `""` | Path to TLS private key file (PEM); both must be set |
| `min_version` | string | `"1.2"` | Minimum TLS version: `"1.2"` or `"1.3"` |

### `gateway.rate_limit`

| Field | Type | Default | Description |
|---|---|---|---|
| `enabled` | bool | `false` | Enable per-IP token-bucket rate limiting |
| `requests_per_second` | float | `10.0` | Sustained request rate per caller IP |
| `burst_size` | int | `20` | Maximum burst above sustained rate |

### `gateway.evidence_retention`

| Field | Type | Default | Description |
|---|---|---|---|
| `max_age` | duration string | `""` | Remove evidence older than this (e.g. `"7d"`, `"24h"`) |
| `max_size_mb` | int | `0` | Remove oldest entries until dir is under this size (MiB). 0 = disabled |
| `check_interval` | duration string | `"1h"` | How often the retention goroutine runs |

---

## Section: `a2a`

Settings for the A2A server and agent card.

| Field | Type | Default | Description |
|---|---|---|---|
| `public_url` | string | — | Public base URL; included in the agent card |
| `name` | string | `"a2a-gateway"` | Agent name (shown in agent card) |
| `description` | string | `""` | Agent description (shown in agent card) |
| `version` | string | `"1.0.0"` | Agent version (shown in agent card) |
| `default_input_modes` | []string | `["text/plain"]` | MIME types accepted as input |
| `default_output_modes` | []string | `["text/plain"]` | MIME types produced as output |

### `a2a.auth`

| Field | Type | Default | Description |
|---|---|---|---|
| `mode` | string | `"none"` | Auth mode: `"none"` or `"bearer"` |
| `bearer_token_env` | string | `""` | Environment variable name holding the bearer token |

### `a2a.skills`

List of skill objects. Skills are advertised in the agent card.

```yaml
a2a:
  skills:
    - id: "text-generation"
      name: "Text Generation"
      description: "Generates text responses"
      tags: ["text", "generation"]
      input_modes: ["text/plain"]
      output_modes: ["text/plain"]
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Unique skill ID |
| `name` | string | Yes | Display name |
| `description` | string | No | Human-readable description |
| `tags` | []string | No | Searchable tags |
| `input_modes` | []string | No | Skill-specific input MIME types |
| `output_modes` | []string | No | Skill-specific output MIME types |

---

## Section: `backend`

Exactly one backend type must be configured.

| Field | Type | Default | Description |
|---|---|---|---|
| `type` | string | — | Required: `"acp"`, `"http"`, or `"a2a"` |

### `backend.acp`

Used when `type: "acp"`.

| Field | Type | Default | Description |
|---|---|---|---|
| `transport` | string | — | Required: `"stdio-spawn"`, `"tcp-connect"`, or `"tcp-spawn"` |
| `command` | string | — | Executable path (required for stdio-spawn and tcp-spawn) |
| `args` | []string | `[]` | Arguments passed to the executable |
| `env` | map[string]string | `{}` | Additional environment variables for the subprocess |
| `cwd` | string | `""` | Working directory for the subprocess |

#### `backend.acp.tcp`

Used for `transport: "tcp-connect"` or `"tcp-spawn"`.

| Field | Type | Default | Description |
|---|---|---|---|
| `host` | string | `"127.0.0.1"` | TCP host to connect to (tcp-connect) or bind to (tcp-spawn) |
| `port` | int | — | Required for tcp-connect/tcp-spawn |
| `startup_timeout` | duration string | `"10s"` | How long to wait for the process to start listening (tcp-spawn only) |

### `backend.http`

Used when `type: "http"`.

| Field | Type | Default | Description |
|---|---|---|---|
| `url` | string | — | Required: Base URL of the OpenAI-compatible endpoint (without `/chat/completions`) |
| `model` | string | — | Model name sent in requests |
| `api_key_env` | string | `""` | Environment variable holding the API key |
| `system_prompt` | string | `""` | System message prepended to every conversation |
| `max_tokens` | int | `4096` | Maximum tokens in the completion |
| `timeout` | duration string | `"60s"` | HTTP client timeout |
| `streaming_enabled` | bool | `true` | Stream response chunks via SSE |

### `backend.a2a`

Used when `type: "a2a"`.

| Field | Type | Default | Description |
|---|---|---|---|
| `url` | string | — | Required: Base URL of the downstream A2A agent |
| `bearer_token_env` | string | `""` | Environment variable holding the bearer token for the downstream agent |

---

## Section: `task`

| Field | Type | Default | Description |
|---|---|---|---|
| `store_path` | string | `""` | SQLite DB path for task persistence. Empty = in-memory (lost on restart) |
| `timeout` | duration string | `"5m"` | Maximum time a single task can run before it is canceled |

---

## Section: `push`

Push notification delivery settings.

| Field | Type | Default | Description |
|---|---|---|---|
| `store_path` | string | `""` | SQLite DB path for push config. Defaults to `<task.store_path>.push` if task.store_path is set |
| `max_retries` | int | `5` | Maximum delivery attempts per push notification |
| `initial_backoff` | duration string | `"1s"` | Delay before first retry |
| `max_backoff` | duration string | `"60s"` | Maximum delay between retries |

---

## Section: `permissions`

Controls what ACP permission requests the gateway allows.

| Field | Type | Default | Description |
|---|---|---|---|
| `default_action` | string | `"deny"` | Default verdict: `"allow"` or `"deny"` |
| `allow_tools` | []string | `[]` | Tool names always allowed |
| `deny_tools` | []string | `[]` | Tool names always denied (overrides allow list) |
| `allow_paths` | []string | `[]` | Filesystem paths always allowed |
| `deny_paths` | []string | `[]` | Filesystem paths always denied (overrides allow list) |

---

## Section: `metrics`

| Field | Type | Default | Description |
|---|---|---|---|
| `enabled` | bool | `false` | Enable Prometheus metrics server |
| `addr` | string | `":9090"` | TCP address for the metrics server |

---

## Section: `tracing`

| Field | Type | Default | Description |
|---|---|---|---|
| `enabled` | bool | `false` | Enable OTLP trace export |
| `endpoint` | string | `""` | OTLP gRPC endpoint (e.g. `"localhost:4317"`) |
| `service_name` | string | `"a2a-gateway"` | Service name used in traces |

---

## Section: `log`

| Field | Type | Default | Description |
|---|---|---|---|
| `level` | string | `"info"` | Log level: `"trace"`, `"debug"`, `"info"`, `"warn"`, `"error"` |
