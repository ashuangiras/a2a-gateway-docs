---
id: api-or-protocols
title: API & Protocols
sidebar_position: 7
---

# API & Protocols

## A2A HTTP interface (inbound)

The gateway serves on `listen_addr` (default `127.0.0.1:8081`).

### Endpoints

| Path | Method | Auth | Description |
|---|---|---|---|
| `/.well-known/agent-card.json` | GET | None | A2A Agent Card discovery |
| `/.well-known/agent-card.json/extended` | GET | None | Extended agent card (ETag-cached) |
| `/` | POST | Bearer (optional) | All A2A JSON-RPC methods |
| `/healthz` | GET | None | Liveness check |

### A2A JSON-RPC methods

All methods follow the [A2A specification](https://a2a-protocol.org). The SDK handles method dispatch.

| Method | Description |
|---|---|
| `tasks/send` | Send a message; receive blocking response |
| `tasks/sendSubscribe` | Send a message; receive SSE event stream |
| `tasks/get` | Retrieve a task by ID |
| `tasks/list` | List tasks with optional filtering |
| `tasks/cancel` | Cancel an in-progress task |
| `tasks/resubscribe` | Re-subscribe to an existing task's event stream |
| `pushNotification/set` | Register a webhook for push notifications |
| `pushNotification/get` | Get registered webhook config |
| `pushNotification/delete` | Remove a webhook |
| `pushNotification/list` | List registered webhooks |

### Example: Send a message

```bash
curl -X POST http://127.0.0.1:8081/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tasks/send",
    "params": {
      "message": {
        "role": "user",
        "parts": [{"kind": "text", "text": "Hello, world"}]
      }
    }
  }'
```

### Example: Streaming subscribe

```bash
curl -X POST http://127.0.0.1:8081/ \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tasks/sendSubscribe",
    "params": {
      "message": {
        "role": "user",
        "parts": [{"kind": "text", "text": "Tell me a story"}]
      }
    }
  }'
```

### Agent Card

The Agent Card is served at `/.well-known/agent-card.json`. It is built from the YAML config:

```json
{
  "name": "my-gateway",
  "description": "...",
  "version": "1.0.0",
  "url": "http://127.0.0.1:8081/",
  "capabilities": {
    "streaming": true,
    "pushNotifications": true,
    "stateTransitionHistory": false
  },
  "skills": [
    {
      "id": "text-generation",
      "name": "Text Generation",
      "description": "...",
      "tags": ["text", "generation"]
    }
  ],
  "defaultInputModes": ["text/plain"],
  "defaultOutputModes": ["text/plain"],
  "supportedInterfaces": ["a2a"]
}
```

### Healthz

```bash
curl http://127.0.0.1:8081/healthz
# {"status":"ok"}
```

### Metrics (optional, separate port)

```bash
curl http://host:9090/metrics
```

See [Observability](./observability.md) for the full metrics reference.

---

## ACP protocol (inbound from backend)

ACP (Agent Control Protocol) is a JSON-RPC protocol spoken between a2a-gateway and a backend executable or TCP server. The gateway implements the ACP client side.

### Transport modes

| Mode | Config value | Behavior |
|---|---|---|
| Stdio spawn | `stdio-spawn` | Gateway spawns the executable; communicates over stdin/stdout |
| TCP connect | `tcp-connect` | Gateway connects to an already-running ACP TCP server |
| TCP spawn | `tcp-spawn` | Gateway spawns the executable in TCP mode; waits for port readiness |

### ACP method names

Method names are constants in `internal/adapter/acp/protocol.go`. They follow the JSON-RPC convention used by ACP-compatible tools.

### Permission requests

An ACP backend may pause task execution and issue a permission request (e.g. to read a file or call a tool). The gateway's default policy is **deny all**. Configure allow/deny lists in the `permissions` section:

```yaml
permissions:
  default_action: "deny"
  allow_tools:
    - "read_file"
    - "write_file"
  allow_paths:
    - "/workspace/output"
```

When a permission request is paused, the task enters `TASK_STATE_INPUT_REQUIRED`. The client must send a follow-up `SendMessage` to resume.

---

## OpenAI-compatible HTTP (outbound — http backend)

The `backend/http` package makes HTTP requests to an OpenAI-compatible `/chat/completions` endpoint.

### Request format

```json
{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ],
  "max_tokens": 4096,
  "stream": true
}
```

### Response handling

- If `streaming_enabled: true` (default), the response is consumed as a server-sent events stream and forwarded as A2A `TaskArtifactUpdateEvent` chunks.
- If streaming is disabled, the full response is awaited and emitted as a single artifact.

---

## A2A client (outbound — a2a backend)

The `backend/a2a` package is itself an A2A client. It uses `a2aclient.NewClient` from the SDK to call `SendStreamingMessage` on the downstream agent.

The downstream agent card is fetched from `<url>/.well-known/agent-card.json` on first use.

Bearer token propagation:

```yaml
backend:
  type: "a2a"
  a2a:
    url: "http://gateway-b:8082"
    bearer_token_env: "DOWNSTREAM_TOKEN"
```

The token is loaded from the named environment variable and passed in the `Authorization: Bearer` header to the downstream agent.
