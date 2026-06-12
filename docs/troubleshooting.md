---
id: troubleshooting
title: Troubleshooting
sidebar_position: 13
---

# Troubleshooting

## Gateway won't start

### "config file not found"

```
Error: failed to load config: open myconfig.yaml: no such file or directory
```

Check the path you passed to `--config`. Use an absolute path if you changed directories after building.

### "listen tcp ... address already in use"

Another process is using `listen_addr`. Change the port in your config or stop the conflicting process:

```bash
lsof -i :8081    # find the process using port 8081
```

### "failed to open SQLite database"

The directory for `store_path` does not exist, or the gateway does not have write permission. Create it first:

```bash
mkdir -p /data
./bin/a2a-gateway serve --config ...
```

### ACP executable not found

```
Error: failed to spawn ACP process: exec: "my-acp": executable file not found in $PATH
```

Check that `backend.acp.command` points to an existing executable. Use an absolute path or ensure it is on `$PATH`.

---

## Authentication failures

### Callers receive 401 Unauthorized

The gateway is running in bearer mode and no token was provided. Include the header:

```
Authorization: Bearer <token>
```

### "invalid token" even though the token is correct

- Ensure there is no trailing newline or whitespace in the token env var
- Compare tokens exactly: `echo -n $A2A_GATEWAY_TOKEN | xxd | head`

---

## Streaming issues

### SSE stream is buffered / chunks arrive all at once

The reverse proxy is buffering the response. Add `proxy_buffering off` to your nginx config.

### "context canceled" after first chunk

The client timed out. Increase the proxy timeout and client read timeout:

```nginx
proxy_read_timeout 300s;
proxy_send_timeout 300s;
```

---

## ACP backend issues

### Tasks stuck in WORKING state

The ACP backend process may have crashed. Check:

```bash
# Is the ACP process running?
pgrep -a <acp-executable-name>

# Check gateway logs for ACP errors
./bin/a2a-gateway serve --config ... 2>&1 | grep -i "acp\|backend\|error"
```

### "ACP process exited unexpectedly"

The spawned ACP process crashed. Check its stderr:

```yaml
backend:
  acp:
    transport: "stdio-spawn"
    command: "/path/to/my-acp"
    args: ["--log-file", "/tmp/acp.log"]
```

### Permission requests are stuck

A task entered `INPUT_REQUIRED` state. Check `permissions` config:

```yaml
permissions:
  default_action: "deny"
  allow_tools:
    - "read_file"
```

To see pending permission requests, the task's state will be `input_required` in `ListTasks`.

---

## SQLite issues

### "database is locked"

SQLite is receiving concurrent writes beyond its capacity. The gateway uses WAL mode with a 5-second busy timeout. In multi-replica deployments, ensure:

- All replicas share the exact same file path
- No other processes are writing to the database file at the same time
- `transport` is `tcp-connect` or `tcp-spawn`, not `stdio-spawn`

### Database file keeps growing

Enable evidence retention:

```yaml
gateway:
  evidence_retention:
    max_age: "7d"
    max_size_mb: 500
    check_interval: "1h"
```

The task store itself has no automatic pruning. Old tasks accumulate in `gateway.db`. Periodic manual cleanup or a future pruning feature is needed.

---

## Rate limiting

### Callers receive 429 Too Many Requests unexpectedly

The `burst_size` is too small for bursty workloads. Increase it:

```yaml
gateway:
  rate_limit:
    enabled: true
    requests_per_second: 10.0
    burst_size: 100    # increase burst allowance
```

---

## Build issues

### "package not found" or import errors

Ensure you have Go 1.25.11:

```bash
go version
# go version go1.25.11 ...
```

If the version is older, install the correct version from https://go.dev/dl/.

### CGO errors

a2a-gateway uses `modernc.org/sqlite` (pure Go, no CGO required). If you see CGO errors, check that you do not have a fork or replacement that requires CGO.

### `make check-boundaries` fails

There is an import boundary violation. The error message lists the offending import. Fix the import to comply with the rules in [Architecture](./architecture.md#package-import-rules).

---

## Logs and diagnostics

### Enable debug logging at runtime

```bash
kill -HUP $(pgrep a2a-gateway)
```

First update `log.level: "debug"` in the config file, then send SIGHUP.

### Enable trace logging (caution: logs request content)

Set in config and restart:

```yaml
log:
  level: "trace"
```

### Verify the gateway is healthy

```bash
curl http://127.0.0.1:8081/healthz
# {"status":"ok"}
```

### Check current metrics

```bash
curl http://127.0.0.1:9090/metrics | grep a2a_
```

---

## Getting help

- Check the [FAQ](./faq.md) for common questions
- Review the [Configuration Reference](./reference/configuration-reference.md) for all available options
- Open an issue at https://github.com/ashuangiras/a2a-gateway/issues
