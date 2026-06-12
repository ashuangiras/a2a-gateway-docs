---
id: intro
title: Introduction
sidebar_position: 1
slug: /intro
---

# a2a-gateway

**a2a-gateway** is a generic protocol gateway that exposes a standard [A2A](https://a2a-protocol.org) interface to external callers while internally driving one of three backend types:

| Backend | How it works |
|---|---|
| `acp` | Drives any ACP-compatible executable over JSON-RPC (stdio or TCP) |
| `http` | Forwards requests to any OpenAI-compatible LLM endpoint |
| `a2a` | Chains to a downstream A2A gateway or agent |

```
A2A callers (agents / orchestrators)
        │ A2A JSON-RPC over HTTP
        ▼
  a2a-gateway binary
  a2asrv (SDK) ──► gateway.Executor ──► backend.Backend
                        │
                   evidence.Store
        │ varies by backend type
        ▼
ACP executable / OpenAI HTTP API / downstream A2A
```

## Why it exists

Different agent tools expose different control protocols. a2a-gateway gives them a common A2A-facing interface so they can participate in A2A-based multi-agent systems without modification.

Key properties:

- **One gateway instance = one configured backend** — fully specified in a single YAML file
- **Vendor-neutral** — no executable name or vendor is hardcoded into the gateway
- **Three backend types** — ACP, OpenAI-compatible HTTP, or downstream A2A
- **Production-ready features** — bearer token auth, TLS, rate limiting, SQLite-backed persistence, push notifications with retry, Prometheus metrics, OpenTelemetry tracing, evidence files

## Core capabilities

| Capability | Details |
|---|---|
| A2A server | Full JSON-RPC method set via `a2a-go/v2` SDK |
| Streaming | SSE streaming for long-running tasks |
| Authentication | Optional bearer token auth on inbound A2A requests |
| TLS | Native TLS on the A2A listener |
| Rate limiting | Per-caller token-bucket rate limiter |
| Push notifications | Webhook delivery with exponential-backoff retry |
| Task persistence | SQLite-backed durable task store (optional) |
| Horizontal scaling | Shared SQLite for multi-replica deployment |
| Evidence files | Per-task audit trail written to disk |
| Evidence retention | Automatic cleanup by age and/or directory size |
| Prometheus metrics | `a2a_tasks_total`, `a2a_task_duration_seconds`, and more |
| OpenTelemetry | OTLP gRPC trace export with W3C propagator |
| Hot reload | SIGHUP reloads config without restart |
| Skill routing | Route different message types to different backends |

## Quick start

```bash
# 1. Build
make build

# 2. Start the gateway (ACP backend example)
./bin/a2a-gateway serve --config agents/gateway-a.yaml

# 3. Send a message
./bin/a2a-gateway send --to http://127.0.0.1:8081 --message "Hello"
```

See [Getting Started](./getting-started.md) for a full walkthrough.

## Documentation overview

| Section | What it covers |
|---|---|
| [Getting Started](./getting-started.md) | Install, run, and send your first message |
| [Configuration](./configuration.md) | All YAML configuration fields |
| [Architecture](./architecture.md) | Package design, layer diagram, import rules |
| [Runtime Model](./runtime-model.md) | Task lifecycle, streaming, event types |
| [API & Protocols](./api-or-protocols.md) | A2A endpoints, ACP protocol, HTTP backend |
| [Security](./security.md) | Auth, TLS, rate limiting, permissions |
| [Observability](./observability.md) | Metrics, tracing, logging |
| [Deployment](./deployment.md) | Single-instance and multi-replica deployment |
| [Development](./development.md) | Build, lint, boundary checks |
| [Testing](./testing.md) | Unit, E2E, and integration test suites |
| [Troubleshooting](./troubleshooting.md) | Common problems and fixes |
| [Reference](./reference/commands.md) | Commands, config reference, env vars, glossary |
