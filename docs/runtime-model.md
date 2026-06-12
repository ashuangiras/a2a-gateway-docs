---
id: runtime-model
title: Runtime Model
sidebar_position: 6
---

# Runtime Model

This page describes how a2a-gateway handles a task at runtime: the event flow, streaming model, and task state machine.

## Task lifecycle

Every inbound A2A request goes through the following lifecycle:

```
1. SDK receives JSON-RPC request (SendMessage or SendStreamingMessage)
2. SDK calls gateway.Executor.Execute(ctx, execCtx)
3. Executor emits TaskSubmitted event
4. Executor emits TaskWorking event
5. Executor calls backend.Backend.Execute(ctx, taskID, history, msg)
6. Backend yields events (status updates, artifacts)
7. Executor forwards all events
8. Executor emits TaskCompleted or TaskFailed
9. Evidence is written to disk
```

## Task states

| State | Meaning |
|---|---|
| `TASK_STATE_SUBMITTED` | Task received, queued |
| `TASK_STATE_WORKING` | Backend is processing |
| `TASK_STATE_COMPLETED` | Backend finished successfully |
| `TASK_STATE_FAILED` | Backend returned an error |
| `TASK_STATE_CANCELED` | Client called `CancelTask` |
| `TASK_STATE_INPUT_REQUIRED` | ACP backend paused for permission approval |

## Event types

The `backend.Backend.Execute` iterator yields two event types:

| Event type | When emitted |
|---|---|
| `*a2a.TaskStatusUpdateEvent` | State transitions (Working, Completed, Failed, InputRequired) |
| `*a2a.TaskArtifactUpdateEvent` | Artifacts (text chunks, binary data) |

## Streaming

The gateway supports SSE streaming when the client calls `SendStreamingMessage`. The event stream is flushed to the HTTP response as events arrive from the backend.

The agent card advertises streaming support:

```json
{
  "capabilities": {
    "streaming": true
  }
}
```

The `send` subcommand automatically uses streaming when the agent card supports it:

```bash
# Streams chunks to stdout as they arrive
a2a-gateway send --to http://127.0.0.1:8081 --message "explain quantum computing"

# Force blocking (non-streaming) mode
a2a-gateway send --to http://127.0.0.1:8081 --message "ping" --no-stream
```

## Evidence files

For every task, a2a-gateway writes an evidence directory to `evidence_dir/<task-id>/`:

| File | Contents |
|---|---|
| `input.txt` | The inbound message text |
| `manifest.json` | Task ID, state, timestamps, backend type |
| `error.txt` | Error message (only on failure) |

Evidence is written asynchronously alongside task execution. Evidence directories are gitignored.

## Evidence retention

If configured, a background goroutine runs at `check_interval` (default 1 hour) and:

1. Removes entries older than `max_age` (e.g. `7d`)
2. Removes the oldest entries until the directory is under `max_size_mb`

```yaml
gateway:
  evidence_retention:
    max_age: "7d"
    max_size_mb: 500
    check_interval: "1h"
```

## Task persistence

By default, the SDK uses an in-memory task store (data lost on restart). Set `task.store_path` to persist tasks to SQLite:

```yaml
task:
  store_path: "/data/gateway.db"
```

`GetTask` and `ListTasks` always return results from the task store. This is particularly important for multi-replica deployments where a task's follow-up request may land on a different replica.

## SIGHUP hot reload

Sending `SIGHUP` to the gateway process triggers a config reload. The following settings reload without restart:

- Log level (`log.level`)
- Rate limit settings (`gateway.rate_limit`)

The atomic reload is implemented in `internal/app/reload.go` using `atomic.Value`.

## Push notifications

When a client registers a push notification webhook via the A2A `pushNotification/set` method, the gateway delivers a notification to the webhook URL on each task state transition.

Delivery is attempted up to `push.max_retries` times with exponential backoff (`initial_backoff` → `max_backoff`). The push config is stored in `gateway.db.push` (SQLite) so any replica can deliver it.

## Concurrency

- Each inbound A2A request is handled in its own goroutine (standard `net/http` behavior)
- Evidence writing runs concurrently with backend execution
- The evidence retention goroutine runs independently in the background
- SQLite WAL mode handles concurrent readers; only one writer at a time
