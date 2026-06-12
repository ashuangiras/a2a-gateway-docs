---
id: glossary
title: Glossary
sidebar_position: 5
---

# Glossary

## A2A (Agent-to-Agent protocol)

An open protocol for communication between AI agents. Defines a JSON-RPC over HTTP API, agent card discovery, SSE streaming, and push notification webhooks. The specification is maintained at https://a2a-protocol.org.

## ACP (Agent Control Protocol)

A JSON-RPC protocol spoken between a2a-gateway and an ACP-compatible backend executable. ACP is lower-level than A2A and is not exposed to external callers. ACP communication happens over stdio or TCP between the gateway process and the backend process.

## agent card

A JSON document served at `/.well-known/agent-card.json` that describes an A2A agent's capabilities, skills, supported input/output modes, and authentication requirements. A2A callers fetch the agent card before sending tasks.

## artifact

A unit of output produced by a task. Artifacts are emitted as `TaskArtifactUpdateEvent` events. An artifact may be a text chunk, binary data, or a file reference. Multiple artifacts can be emitted per task (streaming chunks are separate artifacts).

## backend

The component that performs the actual AI work. a2a-gateway supports three backend types: `acp` (ACP executable), `http` (OpenAI-compatible API), and `a2a` (downstream A2A agent). Defined as the `backend.Backend` interface.

## bearer token

An opaque secret string used for caller authentication. Callers include it in the `Authorization: Bearer <token>` HTTP header. The gateway compares tokens using `crypto/subtle.ConstantTimeCompare` to prevent timing attacks.

## boundary check

The `make check-boundaries` target that enforces package import rules. It prevents disallowed cross-package dependencies (e.g., `gateway` importing `adapter/acp`). Also runs as the `boundary-check` CI job.

## composition root

`internal/app/` — the single package that knows about all concrete types and wires them together. No business logic lives here; it only creates and connects components.

## E2E test

End-to-end test. Tests in `e2e/` that start the real gateway binary against a stub backend and make real HTTP/A2A calls. Distinguished from unit tests (which test individual packages in isolation) and shell integration tests (which use bash and curl).

## evidence

Per-task files written to `evidence_dir/` by a2a-gateway. Contains the task input, a manifest of task metadata, and optionally an error file. Used for debugging and auditing. Managed by the `internal/evidence/` package.

## evidence retention

A background goroutine that periodically removes old evidence directories based on age (`max_age`) and total size (`max_size_mb`). Configured in `gateway.evidence_retention`.

## executor

In a2a-gateway's code, `gateway.Executor` is the type that implements the `a2asrv.AgentExecutor` interface from the A2A SDK. It is the bridge between the SDK's request dispatch and the backend that performs the work.

## extended agent card

An extended version of the agent card, served at `/.well-known/agent-card.json/extended`. Contains additional metadata not in the standard card (e.g., supported ACP permission types). Cached with ETags.

## hot reload

Reloading certain config settings (`log.level`, `gateway.rate_limit`) without restarting the process. Triggered by sending `SIGHUP` to the gateway process.

## JSON-RPC

A remote procedure call protocol encoded as JSON. A2A uses JSON-RPC 2.0 over HTTP. ACP also uses JSON-RPC but over stdio or TCP.

## OTLP

OpenTelemetry Protocol. a2a-gateway exports traces via OTLP gRPC to a configured endpoint (e.g., a Jaeger or Tempo collector). Configured in `tracing.endpoint`.

## permission request

An ACP mechanism by which the backend asks the gateway for approval before taking an action (e.g., reading a file, calling a tool). The gateway evaluates the request against the `permissions` config section. If denied, the request is blocked. If paused/pending, the task enters `INPUT_REQUIRED` state.

## port (ports-and-adapters)

An interface that defines a capability without specifying the implementation. In a2a-gateway, `backend.Backend` is a port. The concrete implementations (`backend/acp`, `backend/http`, `backend/a2a`) are adapters.

## push notification

An HTTP webhook delivery triggered by a task state change. A2A callers can register webhook URLs via the `pushNotification/set` method. The gateway delivers notifications with retry backoff, storing delivery config in `gateway.db.push`.

## skill

A named capability advertised in the agent card. Skills allow A2A callers to discover what kinds of tasks an agent can handle. Configured in `a2a.skills`. The gateway can route tasks to different backends based on skill (future capability).

## SQLite WAL

SQLite Write-Ahead Logging mode. Allows concurrent readers and a single writer. Used by a2a-gateway's task store, push store, and permission store to support multi-replica deployments sharing the same database file.

## SSE (Server-Sent Events)

A one-way push mechanism over HTTP. A2A uses SSE to stream task events (`TaskStatusUpdateEvent`, `TaskArtifactUpdateEvent`) to clients for long-running tasks. Triggered by `tasks/sendSubscribe`.

## stdio

Standard input/output. One of the ACP transport modes: the gateway spawns the backend executable and communicates with it over its stdin and stdout pipes. Transport `stdio-spawn`.

## task

The fundamental unit of work in A2A. A task has an ID, state, message history, and artifacts. A task is submitted by a caller and processed by the gateway's executor. Task state transitions follow the lifecycle: Submitted → Working → Completed/Failed/Canceled/InputRequired.

## task store

The persistent store for A2A task state and message history. In-memory by default (lost on restart). Set `task.store_path` for SQLite persistence.

## W3C traceparent

The W3C distributed tracing standard header (`traceparent`, `tracestate`, `baggage`). a2a-gateway always installs the W3C propagator, so incoming trace context is propagated through the gateway even when OTLP export is disabled.

## WAL mode

See SQLite WAL.
