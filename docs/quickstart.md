---
id: quickstart
title: "Quickstart: 5 Minutes to Your First AI Agent"
sidebar_position: 1
---

# Quickstart: 5 Minutes to Your First AI Agent

This guide is for anyone — no prior knowledge of AI protocols, Go, or servers required. By the end you will have a running AI gateway that you can talk to from your terminal.

---

## What you are building

Think of **a2a-gateway** as a translator box. You put a message in one side (using a standard format called A2A), and it comes out the other side talking to whatever AI service you have — an OpenAI-compatible API, a local model, or another AI agent.

```
You → a2a-gateway → Your AI (OpenAI, Ollama, Anthropic, etc.)
```

---

## What you need before you start

- A computer running macOS or Linux
- [Go](https://go.dev/dl/) installed (version 1.25 or later)  
  Check: open your terminal and type `go version` — if you see a version number, you are good.
- An OpenAI API key **or** [Ollama](https://ollama.com) running locally (free, no key needed)

That's it.

---

## Step 1 — Download the code

Open your terminal and run:

```bash
git clone https://github.com/ashuangiras/a2a-gateway.git
cd a2a-gateway
```

---

## Step 2 — Build the gateway

```bash
make build
```

This creates a file called `bin/a2a-gateway`. It is the gateway program.

---

## Step 3 — Pick your AI backend

Choose **one** of the two options below.

---

### Option A — Use OpenAI (or any OpenAI-compatible API)

Create a file called `my-gateway.yaml` in the `a2a-gateway` folder and paste this in:

```yaml
gateway:
  id: "my-gateway"
  listen_addr: "127.0.0.1:8081"
  evidence_dir: ".evidence"

a2a:
  public_url: "http://127.0.0.1:8081"
  name: "My Gateway"
  auth:
    mode: "none"

backend:
  type: "http"
  http:
    url: "https://api.openai.com/v1"
    model: "gpt-4o-mini"
    api_key_env: "OPENAI_API_KEY"
    streaming_enabled: true

task:
  timeout: "2m"

log:
  level: "info"
```

Then set your API key:

```bash
export OPENAI_API_KEY="sk-..."   # paste your real key here
```

:::tip Using a different provider?
Just change the `url` and `model`. For example:
- **Groq**: `url: "https://api.groq.com/openai/v1"`, `model: "llama-3.1-8b-instant"`, `api_key_env: "GROQ_API_KEY"`
- **Mistral**: `url: "https://api.mistral.ai/v1"`, `model: "mistral-small-latest"`, `api_key_env: "MISTRAL_API_KEY"`
:::

---

### Option B — Use Ollama (free, runs on your computer)

First, [install Ollama](https://ollama.com/download) and pull a model:

```bash
ollama pull llama3.2
```

Then create `my-gateway.yaml`:

```yaml
gateway:
  id: "my-gateway"
  listen_addr: "127.0.0.1:8081"
  evidence_dir: ".evidence"

a2a:
  public_url: "http://127.0.0.1:8081"
  name: "My Gateway"
  auth:
    mode: "none"

backend:
  type: "http"
  http:
    url: "http://127.0.0.1:11434/v1"   # Ollama's OpenAI-compatible endpoint
    model: "llama3.2"
    api_key_env: ""
    streaming_enabled: true

task:
  timeout: "5m"

log:
  level: "info"
```

No API key needed.

---

## Step 4 — Start the gateway

```bash
./bin/a2a-gateway serve --config my-gateway.yaml
```

You should see something like:

```
{"level":"info","msg":"a2a server listening","addr":"127.0.0.1:8081"}
```

The gateway is running. **Leave this terminal open.**

---

## Step 5 — Say hello

Open a **second terminal** in the same folder and run:

```bash
./bin/a2a-gateway send --to http://127.0.0.1:8081 --message "Hello! What can you do?"
```

You will see the AI's response stream back to your terminal, word by word.

Try another message:

```bash
./bin/a2a-gateway send --to http://127.0.0.1:8081 --message "Explain quantum computing in 2 sentences"
```

---

## Step 6 — Check the health endpoint

In a browser or terminal:

```bash
curl http://127.0.0.1:8081/healthz
```

Expected response:

```json
{"status":"ok"}
```

---

## Step 7 — Stop the gateway

Go back to the first terminal and press `Ctrl + C`.

---

## What just happened?

When you ran `send`, the gateway:

1. Received your message in the standard A2A format
2. Translated it into an OpenAI-style API call
3. Streamed the response back to your terminal

The AI never knew it was talking to a gateway. The gateway handled the translation invisibly.

---

## What can you do next?

| I want to... | Where to look |
|---|---|
| Understand all the config options | [Configuration Reference](./reference/configuration-reference.md) |
| Run the gateway as a background service | [Deployment](./deployment.md) |
| Add authentication so only you can use it | [Security](./security.md) |
| Connect two gateways together | [Getting Started — A2A backend](./getting-started.md) |
| See what the gateway is doing internally | [Observability](./observability.md) |
| Understand what A2A means | [Glossary](./reference/glossary.md) |

---

## Having trouble?

- **`go: command not found`** — Install Go from https://go.dev/dl/
- **`make: command not found`** (Windows) — Run `go build -o bin/a2a-gateway ./cmd/a2a-gateway` instead
- **`connection refused` on port 8081** — The gateway is not running. Go back to Step 4.
- **401 error** — You are using bearer auth mode. Remove the `auth` section or set the token.
- **OpenAI 401** — Your `OPENAI_API_KEY` is wrong or not exported. Re-run `export OPENAI_API_KEY="sk-..."`.

More help: [Troubleshooting](./troubleshooting.md)
