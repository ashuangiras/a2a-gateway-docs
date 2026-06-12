---
id: getting-started
title: Getting Started
sidebar_position: 2
---

# Getting Started

This guide walks you through building a2a-gateway, configuring a backend, and sending your first A2A message.

## Prerequisites

- **Go 1.25.11** or later (`go version`)
- **Git**
- An ACP-compatible executable, an OpenAI-compatible endpoint, or a downstream A2A agent — depending on which backend type you want to use

## Step 1: Clone and build

```bash
git clone https://github.com/ashuangiras/a2a-gateway.git
cd a2a-gateway
make build
```

The binary is written to `bin/a2a-gateway`.

Verify:

```bash
./bin/a2a-gateway version
```

## Step 2: Choose a backend type

a2a-gateway supports three backend types. Pick the one that matches your environment.

### Option A: ACP backend (spawn an ACP executable)

Requires an ACP-compatible executable installed on your system.

Use the example config at `agents/gateway-a.yaml`:

```yaml
gateway:
  id: "gateway-a"
  role: "assistant"
  listen_addr: "127.0.0.1:8081"
  evidence_dir: ".evidence"

a2a:
  public_url: "http://127.0.0.1:8081"
  auth:
    mode: "none"

backend:
  type: "acp"
  cwd: "."
  acp:
    transport: "stdio-spawn"
    executable: "copilot"        # replace with your ACP executable
    args: ["--acp", "--stdio"]

permissions:
  default_action: "allow"

task:
  timeout: "10m"
```

Replace `executable: "copilot"` with the path to your ACP-compatible tool.

### Option B: HTTP backend (OpenAI-compatible LLM)

No external executable needed. Configure an OpenAI-compatible endpoint:

```yaml
backend:
  type: "http"
  http:
    url: "https://api.openai.com/v1"
    api_key_env: "OPENAI_API_KEY"
    model: "gpt-4o"
    system_prompt: "You are a helpful assistant."
    max_tokens: 4096
    timeout: "120s"
```

Set your API key:

```bash
export OPENAI_API_KEY="sk-..."
```

### Option C: A2A backend (chain to another gateway)

Forward tasks to a downstream A2A agent:

```yaml
backend:
  type: "a2a"
  a2a:
    url: "http://gateway-b:8082"
    timeout: "5m"
```

## Step 3: Start the gateway

```bash
./bin/a2a-gateway serve --config agents/gateway-a.yaml
```

You should see structured JSON log output. The gateway is ready when you see:

```
{"level":"info","msg":"a2a server listening","addr":"127.0.0.1:8081"}
```

## Step 4: Send a message

In a second terminal:

```bash
./bin/a2a-gateway send --to http://127.0.0.1:8081 --message "Hello, world"
```

The `send` command:
- Fetches the agent card from `/.well-known/agent-card.json`
- Uses SSE streaming if the agent card advertises it
- Prints response chunks as they arrive

## Step 5: Check the agent card

```bash
curl http://127.0.0.1:8081/.well-known/agent-card.json | jq .
```

This returns the A2A Agent Card describing the gateway's capabilities, skills, and supported interfaces.

## Step 6: Check health

```bash
curl http://127.0.0.1:8081/healthz
```

Returns `{"status":"ok"}` when the gateway is running.

## Validate a config file

```bash
./bin/a2a-gateway config validate --config agents/gateway-a.yaml
```

Validates the YAML config without starting the server.

## Next steps

- [Installation](./installation.md) — detailed build and install options
- [Configuration](./configuration.md) — all config fields explained
- [Security](./security.md) — set up bearer auth and TLS for production
