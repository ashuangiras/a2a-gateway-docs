---
id: faq
title: FAQ
sidebar_position: 14
---

# Frequently Asked Questions

## General

### What is a2a-gateway?

a2a-gateway is a Go binary that acts as an A2A (agent-to-agent) protocol server in front of one backend. The backend can be:
- An **ACP-compatible executable** (spawned or connected via TCP)
- An **OpenAI-compatible HTTP API** (any LLM API following the `/chat/completions` format)
- Another **A2A agent** (gateway chaining / cascading)

See [Architecture](./architecture.md) for the full picture.

### What is the A2A protocol?

A2A (Agent-to-Agent) is an open protocol for communication between AI agents. It defines:
- An HTTP/JSON-RPC API for sending tasks to agents
- An agent card discovery mechanism (`/.well-known/agent-card.json`)
- Streaming via Server-Sent Events (SSE)
- Push notification webhooks

See the [A2A specification](https://a2a-protocol.org) for the full protocol definition.

---

## Is there a Docker image?

No. There is no official Dockerfile or published container image at this time.

You can build one yourself:

```dockerfile
# Build stage
FROM golang:1.25 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o /bin/a2a-gateway ./cmd/a2a-gateway

# Runtime stage
FROM gcr.io/distroless/static:nonroot
COPY --from=builder /bin/a2a-gateway /bin/a2a-gateway
ENTRYPOINT ["/bin/a2a-gateway"]
```

A Dockerfile and Kubernetes manifests are on the future roadmap. See the open issues for status.

---

## Does a2a-gateway support multiple backends?

No — each gateway instance routes to exactly one backend. To support multiple backends, run multiple gateway instances (one per backend) and use A2A chaining (the `a2a` backend type) to connect them.

---

## Can a2a-gateway fan out to multiple backends in parallel?

Not currently. The gateway routes a task to one backend. Parallel fan-out would require a custom `backend.Backend` implementation. It is architecturally possible because `backend.Backend` returns an iterator.

---

## How do I upgrade the gateway?

Build the new binary and replace the old one:

```bash
git pull
make build
# stop old process
./bin/a2a-gateway serve --config /etc/a2a-gateway/gateway.yaml
```

If you are running multiple replicas behind a load balancer, do a rolling update: stop one replica at a time, upgrade, restart.

---

## Can I run multiple gateways in a cluster?

Yes. See [Deployment — Multi-replica](./deployment.md#multi-replica-horizontal-scaling).

Requirements:
- Shared SQLite files (`store_path`)
- ACP backend uses `tcp-connect` or `tcp-spawn` (not `stdio-spawn`)
- All replicas use the same config

---

## How do I hot-reload config without restart?

Send `SIGHUP`:

```bash
kill -HUP $(pgrep a2a-gateway)
```

This reloads `log.level` and `gateway.rate_limit` atomically. Other fields require restart.

---

## Does a2a-gateway store conversation history?

The SDK task store records the full message history for each task (in memory or SQLite). Each call to `SendMessage` or `SendStreamingMessage` starts a new task with a new task ID.

Multi-turn conversation state is tracked within a task via `SendMessage` follow-ups, not across separate tasks.

---

## Does a2a-gateway support tool/function calling?

Indirectly. If the ACP backend supports tool calls (via ACP permission requests), the gateway will surface the `INPUT_REQUIRED` state to the A2A client. The client can then provide the tool result in a follow-up `SendMessage`.

The HTTP and A2A backends do not implement a gateway-level tool-calling loop. The downstream model or agent handles tool calling internally.

---

## Does a2a-gateway support OAuth or API key auth for callers?

Currently only bearer token auth is supported:

```yaml
a2a:
  auth:
    mode: "bearer"
    bearer_token_env: "A2A_GATEWAY_TOKEN"
```

OAuth/OIDC is not built in. Use an external API gateway or proxy if you need OAuth.

---

## Can a2a-gateway talk to OpenAI, Anthropic, etc.?

Yes, via the `http` backend type. Any provider that implements the OpenAI `/chat/completions` API format works:

```yaml
backend:
  type: "http"
  http:
    url: "https://api.openai.com/v1"
    model: "gpt-4o"
    api_key_env: "OPENAI_API_KEY"
    streaming_enabled: true
```

Substitute the URL and model for Anthropic, Mistral, Groq, local Ollama, etc.

---

## What version of Go is required?

Go 1.25.11 or later. The module is at `go 1.25.11` in `go.mod`. Earlier versions of Go will fail to build.

---

## Does a2a-gateway require CGO?

No. The SQLite driver (`modernc.org/sqlite`) is pure Go and requires no CGO. Cross-compilation works with:

```bash
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build ./cmd/a2a-gateway
```

---

## Is the A2A protocol stable?

The A2A protocol and the `a2a-go` SDK are under active development. Breaking changes between SDK versions may require config or code updates. Pin to a known-good SDK version in `go.mod`.
