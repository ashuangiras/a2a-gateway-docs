---
id: repository-map
title: Repository Map
sidebar_position: 4
---

# Repository Map

Annotated directory listing of the `a2a-gateway` repository.

```
a2a-gateway/
│
├── cmd/
│   └── a2a-gateway/         # CLI entry point
│       ├── main.go           # main() — calls root command
│       ├── root.go           # cobra root command, global flags
│       ├── serve.go          # `serve` subcommand
│       ├── validate.go       # `validate` subcommand
│       └── send.go           # `send` subcommand
│
├── internal/                 # All private implementation code
│   │
│   ├── app/                  # Composition root — wires all packages
│   │   ├── command.go        # RunServe: build and start server
│   │   ├── reload.go         # SIGHUP config hot reload
│   │   └── middleware.go     # HTTP middleware (logging, auth, rate limit)
│   │
│   ├── config/               # Config loading and validation
│   │   ├── config.go         # Top-level Config struct
│   │   ├── load.go           # YAML unmarshal + defaults
│   │   └── validate.go       # Validation rules
│   │
│   ├── gateway/              # Core A2A executor and routing logic
│   │   ├── executor.go       # gateway.Executor (implements a2asrv.AgentExecutor)
│   │   ├── router.go         # Skill-based message routing
│   │   └── content_guard.go  # MIME-type filtering
│   │
│   ├── backend/              # Backend port interface
│   │   ├── backend.go        # backend.Backend interface definition
│   │   └── builder.go        # Build concrete Backend from config
│   │
│   ├── backend/acp/          # ACP backend implementation
│   │   └── backend.go        # Wraps adapter/acp; implements backend.Backend
│   │
│   ├── backend/http/         # HTTP (OpenAI-compatible) backend
│   │   └── backend.go        # Calls /chat/completions; streams response
│   │
│   ├── backend/a2a/          # A2A downstream backend (gateway chaining)
│   │   └── backend.go        # Calls downstream a2aclient.SendStreamingMessage
│   │
│   ├── adapter/acp/          # ACP protocol adapter (stdlib-only import rules)
│   │   ├── client.go         # JSON-RPC client over stdio or TCP
│   │   ├── process.go        # Subprocess lifecycle (spawn, wait, kill)
│   │   ├── protocol.go       # ACP method name constants
│   │   └── codec.go          # ACP request/response types
│   │
│   ├── evidence/             # Per-task evidence files
│   │   ├── store.go          # FilesystemStore: write input/manifest/error
│   │   └── retention.go      # Background sweep (age + size limits)
│   │
│   ├── taskstore/            # A2A task persistence
│   │   └── sqlite.go         # SQLite-backed task store
│   │
│   ├── push/                 # Push notification delivery
│   │   ├── store.go          # SQLite store for webhook registrations
│   │   └── sender.go         # Delivery loop with retry backoff
│   │
│   ├── metrics/              # Prometheus metric definitions
│   │   └── metrics.go        # All a2a_* counters, histograms, gauges
│   │
│   ├── logger/               # Structured logger wrapper
│   │   └── logger.go         # Wraps go.uber.org/zap; level hot-reload
│   │
│   └── telemetry/            # OpenTelemetry setup
│       └── otel.go           # OTLP exporter init, W3C propagator install
│
├── e2e/                      # End-to-end Go tests
│   ├── e2e_test.go           # Test cases using real binary + stub backend
│   └── stub/
│       └── stub.go           # Stub ACP/A2A server for E2E tests
│
├── scripts/                  # Shell integration test suites
│   ├── test-all.sh           # Runner for all 18 shell suites
│   ├── test-core.sh          # Basic send/get/list/cancel tests
│   ├── test-streaming.sh     # SSE streaming delivery tests
│   ├── test-auth.sh          # Bearer token accept/reject tests
│   ├── test-rate-limit.sh    # Rate limiting (429) tests
│   ├── test-tls.sh           # TLS listener tests
│   ├── test-http-backend.sh  # OpenAI-compatible backend tests
│   ├── test-a2a-chaining.sh  # A2A → A2A backend tests
│   ├── test-evidence.sh      # Evidence file creation tests
│   ├── test-evidence-retention.sh # Retention sweep tests
│   ├── test-extended-agent-card.sh # Extended agent card tests
│   ├── test-push-retry.sh    # Push notification retry tests
│   ├── test-horizontal-scaling.sh  # Multi-replica tests
│   ├── test-healthz.sh       # /healthz endpoint tests
│   ├── test-metrics.sh       # Prometheus metric counter tests
│   ├── test-tracing.sh       # OTel trace propagation tests
│   ├── test-permissions.sh   # ACP permission allow/deny tests
│   ├── test-skills.sh        # Skill routing tests
│   └── test-sighup.sh        # SIGHUP hot reload tests
│
├── agents/                   # Example and default config files
│   └── *.yaml                # One YAML per agent/backend type example
│
├── docs/                     # Developer documentation (Markdown)
│   ├── architecture.md       # Package design and boundaries
│   ├── package-boundaries.md # Import rule table
│   ├── security.md           # Security model and controls
│   ├── scaling.md            # Multi-replica deployment
│   ├── lessons-learned.md    # Engineering notes and Go version history
│   ├── preflight.md          # Local development workflow
│   ├── future-work.md        # Roadmap items
│   └── status-archive.md     # Historical plan archive
│
├── docs-source/              # Documentation authoring inputs
│   └── discovery/
│       └── a2a-gateway-discovery.md  # Phase 1 factual inventory
│
├── website/                  # Docusaurus documentation site
│   ├── docusaurus.config.ts  # Site configuration
│   ├── sidebars.ts           # Sidebar navigation
│   ├── package.json          # Node.js dependencies
│   ├── docs/                 # All documentation pages (MDX/Markdown)
│   │   ├── intro.md
│   │   ├── getting-started.md
│   │   ├── installation.md
│   │   ├── configuration.md
│   │   ├── architecture.md
│   │   ├── runtime-model.md
│   │   ├── api-or-protocols.md
│   │   ├── security.md
│   │   ├── observability.md
│   │   ├── deployment.md
│   │   ├── development.md
│   │   ├── testing.md
│   │   ├── troubleshooting.md
│   │   ├── faq.md
│   │   └── reference/
│   │       ├── commands.md
│   │       ├── configuration-reference.md
│   │       ├── environment-variables.md
│   │       ├── repository-map.md
│   │       └── glossary.md
│   ├── src/
│   │   └── pages/
│   │       └── index.tsx     # Custom homepage
│   └── static/
│       └── .nojekyll         # Prevents GitHub Pages Jekyll processing
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml            # Build, test, boundary-check, security-scan CI
│   │   └── docs-pages.yml    # Docusaurus → GitHub Pages deployment
│   └── copilot-instructions.md  # AI assistant coding guidelines
│
├── go.mod                    # Go module definition (module a2a-gateway, go 1.25.11)
├── go.sum                    # Module checksums
├── Makefile                  # All build, test, and CI targets
├── .golangci.yml             # golangci-lint configuration
├── .gitignore                # Ignores: bin/, .evidence/, fake-acp, node_modules/
└── README.md                 # Project README
```

## Key paths

| Path | Purpose |
|---|---|
| `cmd/a2a-gateway/` | Everything the binary directly exposes |
| `internal/app/` | Composition root — only place that imports all packages |
| `internal/gateway/` | Business logic — implements the A2A executor |
| `internal/backend/` | Port interface — the boundary between gateway and backends |
| `internal/adapter/acp/` | ACP adapter — stdlib-only imports |
| `website/` | Docusaurus docs site |
| `agents/` | Example config files (start here for quick setup) |
