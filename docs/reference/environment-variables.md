---
id: environment-variables
title: Environment Variables
sidebar_position: 3
---

# Environment Variables

a2a-gateway reads configuration from environment variables at startup. Variables are referenced by name in the YAML config using `*_env` fields.

## Security-sensitive variables

These variables hold secrets and must never be hardcoded in config files.

| Variable | Config field | Description |
|---|---|---|
| `A2A_GATEWAY_TOKEN` (or any name) | `a2a.auth.bearer_token_env` | Bearer token for A2A caller authentication |
| `OPENAI_API_KEY` (or any name) | `backend.http.api_key_env` | API key for HTTP backend (OpenAI, Anthropic, etc.) |
| `DOWNSTREAM_TOKEN` (or any name) | `backend.a2a.bearer_token_env` | Bearer token for downstream A2A agent |

The variable name is configurable — the YAML field holds the environment variable name to look up, not the secret value itself.

**Example:**

```yaml
a2a:
  auth:
    mode: "bearer"
    bearer_token_env: "MY_GATEWAY_SECRET"    # name of env var
```

```bash
export MY_GATEWAY_SECRET="abc123"
a2a-gateway serve --config ...
```

## Operational variables

| Variable | Description | Overrides |
|---|---|---|
| `LOG_LEVEL` | Sets log level at startup | `log.level` in config |

The `LOG_LEVEL` variable is read at startup only. To change the log level without restart, update the config file and send `SIGHUP`.

## No implicit environment variable loading

a2a-gateway does not load `.env` files or a system-wide env file. All environment variables must be set in the calling shell or process manager before the binary starts.

**systemd example:**

```ini
[Service]
Environment=A2A_GATEWAY_TOKEN=<value>
Environment=OPENAI_API_KEY=<value>
```

**Docker/container example:**

```bash
docker run \
  -e A2A_GATEWAY_TOKEN=abc123 \
  -e OPENAI_API_KEY=sk-... \
  my-a2a-gateway-image serve --config /config.yaml
```

## No automatic credential injection

a2a-gateway does not integrate with cloud secret managers (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, HashiCorp Vault) directly. To use managed secrets:

1. Retrieve the secret using your cloud provider's CLI/SDK
2. Export it as an environment variable
3. Start the gateway

Or use a secrets-injection sidecar (e.g., External Secrets Operator in Kubernetes).
