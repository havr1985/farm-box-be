# Docker Setup

## Додані файли

- `Dockerfile` — multi-stage build (targets: dev, build, migrate, seed, prod, prod-distroless)
- `compose.yml` — prod-like стек (api + postgres)
- `compose.dev.yml` — dev override (hot reload, MinIO, bind mounts)
- `.dockerignore`
- `.env.example`

## Команди запуску

### Dev (hot reload)

```bash
docker compose -f compose.yml -f compose.dev.yml up --build
```

### Prod-like

```bash
docker compose -f compose.yml up --build
```

### Міграції та seed

```bash
docker compose -f compose.yml --profile tools run --rm migrate
docker compose -f compose.yml --profile tools run --rm seed
```

## Мережі

- `internal` (internal: true) — postgres ізольований, не доступний ззовні
- `public` — api приймає зовнішні з'єднання
- Postgres без `ports:` — тільки через internal мережу

## Порівняння образів

```
$ docker image ls | grep farmbox

IMAGE                 SIZE
farmbox-prod          365MB
farmbox-distroless    338MB
```

Distroless на 27MB менший — нема shell, package manager, pnpm, system utilities. Тільки Node.js runtime, production dependencies і compiled JS.

**Distroless безпечніший:** нема shell (неможливо виконати команди при RCE), нема package manager (неможливо встановити інструменти), менша поверхня атаки.

## Перевірка non-root

### prod (node:22-alpine)

```bash
$ docker run --rm farmbox-prod id
uid=1000(node) gid=1000(node) groups=1000(node)
```

### prod-distroless

Distroless не має shell і команди `id`. Non-root гарантується через `USER nonroot` в Dockerfile — базовий образ `gcr.io/distroless/nodejs22-debian12` містить вбудованого користувача `nonroot` (uid=65534).

## Секрети

- `.env` не комітиться (в `.gitignore`)
- `.env.example` — шаблон без реальних значень
- Секрети передаються через `env_file: .env`, не хардкодяться в compose/Dockerfile