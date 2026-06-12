---
id: security
title: Security
sidebar_position: 8
---

# Security

## Summary

| Control | Default | Notes |
|---|---|---|
| A2A auth | Off (`mode: none`) | Enable bearer for production |
| TLS | Off | Configure `tls.cert_file` + `tls.key_file` |
| Rate limiting | Off | Enable `gateway.rate_limit` |
| Body size limit | 4 MiB | Set `gateway.max_request_body_bytes` |
| ACP permission requests | Deny all | Configure `permissions` allowlists |
| A2A listen address | `127.0.0.1` | Never expose on `0.0.0.0` without auth |
| ACP TCP port | Localhost only | Never expose to public internet |
| Bearer token comparison | Constant-time | `crypto/subtle.ConstantTimeCompare` |

## A2A server auth

### No auth (default — localhost only)

```yaml
a2a:
  auth:
    mode: "none"
```

Any caller that can reach the port can submit tasks. Suitable for local development only.

### Bearer token auth

```yaml
a2a:
  auth:
    mode: "bearer"
    bearer_token_env: "A2A_GATEWAY_TOKEN"
```

Set the token before starting:

```bash
export A2A_GATEWAY_TOKEN="a-long-random-secret"
./bin/a2a-gateway serve --config myconfig.yaml
```

Callers must include:

```
Authorization: Bearer a-long-random-secret
```

**Important**: The token is loaded from an environment variable at startup and compared using `crypto/subtle.ConstantTimeCompare` to prevent timing attacks. Never hardcode the token in the config file or commit it to source control.

## TLS

Enable native TLS on the A2A listener:

```yaml
gateway:
  tls:
    cert_file: "/path/to/server.crt"
    key_file: "/path/to/server.key"
    min_version: "1.2"    # "1.2" (default) or "1.3"
```

Both `cert_file` and `key_file` must be set together.

For production, prefer TLS 1.3:

```yaml
gateway:
  tls:
    cert_file: "/certs/server.crt"
    key_file: "/certs/server.key"
    min_version: "1.3"
```

## Rate limiting

Per-caller token-bucket rate limiter. The caller identity is the client IP address.

```yaml
gateway:
  rate_limit:
    enabled: true
    requests_per_second: 10.0    # sustained rate
    burst_size: 20               # maximum burst above sustained rate
```

Requests exceeding the limit receive HTTP 429.

## Body size limit

Incoming request bodies are capped. Default is 4 MiB. Requests exceeding the limit receive HTTP 413.

```yaml
gateway:
  max_request_body_bytes: 4194304    # 4 MiB (default)
```

## Network exposure

### A2A server

The A2A server binds to `127.0.0.1` by default:

```yaml
gateway:
  listen_addr: "127.0.0.1:8081"
```

**Do not change to `0.0.0.0` without enabling bearer auth and rate limiting.**

For production deployments beyond localhost:
- Use `mode: bearer` authentication
- Enable TLS
- Run behind a reverse proxy (nginx, Caddy) with additional controls
- Apply network-level access controls (firewall, VPC, private subnet)

### ACP TCP ports

When using `tcp-connect` or `tcp-spawn`, the ACP server binds on a TCP port. **This port must never be exposed to the public internet.**

- Always use `127.0.0.1` for ACP TCP (not `0.0.0.0`)
- There is no authentication on the ACP channel
- If multi-host ACP is needed, use an encrypted tunnel (mTLS, WireGuard)

## Spawned executables

When using `stdio-spawn` or `tcp-spawn`, the gateway runs the configured binary as a child process. The binary has:

- The same filesystem permissions as the gateway process
- Access to env vars passed via the `env` section of the ACP config
- Full access to the configured `cwd`

**Only configure executables you have reviewed and control. Do not accept executable paths from user input.**

## ACP permission requests

ACP backends may issue permission requests during task execution (e.g. to read a file, call a tool). The gateway denies all requests by default:

```yaml
permissions:
  default_action: "deny"
```

To allow specific tools or paths:

```yaml
permissions:
  default_action: "deny"
  allow_tools:
    - "read_file"
    - "write_file"
  allow_paths:
    - "/workspace/output"
  deny_tools: []
  deny_paths: []
```

Do not set `default_action: "allow"` in production without a careful review of what the backend may request.

## Evidence files

Evidence directories contain per-task input and output. They may contain sensitive data:

- Stored in `gateway.evidence_dir` (default `.evidence/`)
- Gitignored by default
- May be cleaned automatically via `gateway.evidence_retention`
- Protect the evidence directory with appropriate filesystem permissions

## Downstream A2A tokens

When using the `a2a` backend type, bearer tokens for the downstream agent are loaded from environment variables:

```yaml
backend:
  type: "a2a"
  a2a:
    bearer_token_env: "DOWNSTREAM_TOKEN"
```

Tokens are never logged. Set them as environment variables, not in config files.

## Security scanning

The CI pipeline runs `govulncheck ./...` on every push. Current baseline: Go 1.25.11 (all known stdlib vulnerabilities fixed).
