---
id: installation
title: Installation
sidebar_position: 3
---

# Installation

## Requirements

- Go 1.25.11 or later
- Git

There is no CGO dependency. The binary is fully self-contained (SQLite is embedded via `modernc.org/sqlite`, a pure-Go implementation).

## Build from source

```bash
git clone https://github.com/ashuangiras/a2a-gateway.git
cd a2a-gateway
make build
```

The binary is written to `bin/a2a-gateway`.

## Verify the build

```bash
./bin/a2a-gateway version
./bin/a2a-gateway help
```

## Install to PATH (optional)

```bash
cp bin/a2a-gateway /usr/local/bin/a2a-gateway
```

## Build with version injection

```bash
go build -ldflags "-X main.Version=$(git describe --tags --always)" \
    -o bin/a2a-gateway ./cmd/a2a-gateway
```

The version string is returned by `a2a-gateway version`.

## Build for a different platform

```bash
GOOS=linux GOARCH=amd64 go build -o bin/a2a-gateway-linux-amd64 ./cmd/a2a-gateway
```

## Available Makefile targets

See [Reference: Commands](./reference/commands.md) for the full Makefile target list.

| Target | Description |
|---|---|
| `make build` | Compile binary to `bin/a2a-gateway` |
| `make check` | Boundary checks + vet + config validation |
| `make ci` | Full local CI: fmt, boundaries, vet, test, build |
| `make test` | Unit tests with race detector |

## Docker / containers

No official container image or Dockerfile is provided at this time. Building a container is straightforward — copy the binary into a minimal image. See [Future Work](./faq.md#is-there-a-docker-image) for status.

## GitHub releases

Pre-built binaries for tagged releases are available at:  
[https://github.com/ashuangiras/a2a-gateway/releases](https://github.com/ashuangiras/a2a-gateway/releases)
