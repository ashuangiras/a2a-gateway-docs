---
id: observability
title: Observability
sidebar_position: 9
---

# Observability

a2a-gateway provides three observability channels: Prometheus metrics, OpenTelemetry distributed tracing, and structured logging.

## Prometheus metrics

### Enabling

```yaml
metrics:
  enabled: true
  addr: ":9090"    # separate server; default port 9090
```

Access: `curl http://localhost:9090/metrics`

### Available metrics

All metrics use the `a2a` namespace (prefix `a2a_`).

| Metric | Type | Labels | Description |
|---|---|---|---|
| `a2a_tasks_total` | Counter | `state` | Tasks reaching each terminal state |
| `a2a_task_duration_seconds` | Histogram | `state` | Wall-clock time from Submitted to terminal state |
| `a2a_messages_total` | Counter | `method` | Incoming A2A method calls |
| `a2a_message_errors_total` | Counter | `method`, `code` | A2A JSON-RPC error responses |
| `a2a_push_notifications_total` | Counter | `status` | Push notification delivery attempts |
| `a2a_active_tasks` | Gauge | — | Currently in-progress tasks |

**`state` label values**: `completed`, `failed`, `canceled`, `input_required`

**`method` label examples**: `SendMessage`, `SendStreamingMessage`, `GetTask`, `ListTasks`, `CancelTask`

**`code` label values**: numeric JSON-RPC error codes (e.g. `-32600`)

**`status` label values**: `success`, `failure`

### Historgram buckets for `a2a_task_duration_seconds`

```
0.05s, 0.1s, 0.25s, 0.5s, 1s, 2.5s, 5s, 10s, 30s, 60s, 120s
```

### Example Prometheus scrape config

```yaml
scrape_configs:
  - job_name: a2a-gateway
    static_configs:
      - targets: ['localhost:9090']
```

### Example PromQL queries

```promql
# Task success rate over 5 minutes
rate(a2a_tasks_total{state="completed"}[5m])

# Average task duration for completed tasks
rate(a2a_task_duration_seconds_sum{state="completed"}[5m])
  / rate(a2a_task_duration_seconds_count{state="completed"}[5m])

# Error rate by method
rate(a2a_message_errors_total[5m])

# Active tasks
a2a_active_tasks
```

---

## OpenTelemetry tracing

### Enabling

```yaml
tracing:
  enabled: true
  endpoint: "localhost:4317"    # OTLP gRPC receiver address
  service_name: "a2a-gateway"
```

### Propagation

The W3C `traceparent` + `baggage` propagator is **always installed**, even when `tracing.enabled: false`. This means incoming requests with `traceparent` headers are correctly parsed and trace context is propagated even when export is disabled.

### Export format

Traces are exported via OTLP gRPC to the configured `endpoint`. Use any OTLP-compatible collector (Jaeger, Tempo, Honeycomb, etc.).

### Spans

HTTP requests to the A2A server are instrumented via `otelhttp.NewHandler` (`go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp`). Each inbound request produces a root span.

### Running a local collector

Example with the OpenTelemetry Collector:

```yaml
# otel-collector.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
exporters:
  logging:
    loglevel: debug
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [logging]
```

---

## Structured logging

a2a-gateway uses `go.uber.org/zap` for structured JSON logging.

### Log levels

| Level | Config value |
|---|---|
| Trace | `trace` |
| Debug | `debug` |
| Info | `info` (default) |
| Warning | `warn` |
| Error | `error` |

### Configure via YAML

```yaml
log:
  level: "info"
```

### Override at startup

```bash
LOG_LEVEL=debug ./bin/a2a-gateway serve --config myconfig.yaml
```

### Change at runtime (without restart)

Send `SIGHUP`. The log level in the config file is reloaded atomically.

### Log format

Production output is newline-delimited JSON:

```json
{"level":"info","ts":1749734400.123,"caller":"app/command.go:88","msg":"a2a server listening","addr":"127.0.0.1:8081"}
{"level":"info","ts":1749734401.456,"caller":"app/middleware.go:45","msg":"request","method":"POST","path":"/","duration_ms":12}
```

### Request logging

The middleware in `internal/app/middleware.go` logs each inbound request: method, path, status code, and duration.

### Trace-level logging

At `trace` level, full request and response bodies are logged. **Do not use trace level in production** — it will log potentially sensitive message content.
