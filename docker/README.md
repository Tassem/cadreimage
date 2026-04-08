# Docker Setup Notes

## First Run — Apply Database Schema

After the stack starts for the first time, apply the Drizzle schema to the database.
Run this command from your local machine (not inside the container):

```bash
# Make sure postgres is healthy first
docker-compose up -d postgres
docker-compose ps postgres   # wait until Status = healthy

# Apply the full schema using drizzle-kit push
DATABASE_URL=postgresql://newscard:changeme@localhost:5432/newscard \
  pnpm --filter @workspace/db run push
```

> **Note:** Replace `changeme` with the `POSTGRES_PASSWORD` value from your `.env` file.
> The `push` script is defined in `lib/db/package.json` and uses `drizzle-kit push`.

## Services

| Service | Port | URL |
|---------|------|-----|
| API | 8080 | http://localhost:8080/api/health |
| Free Generator | 3000 | http://localhost:3000 |
| Pro Dashboard | 3001 | http://localhost:3001/pro/ |
| PostgreSQL | 5432 | postgresql://localhost:5432/newscard |

## Full Startup Sequence

```bash
# 1. Configure environment
cp .env.example .env
# edit .env with your secrets

# 2. Build and start all services
docker-compose up -d --build

# 3. Wait for postgres to be healthy, then push schema
DATABASE_URL=postgresql://newscard:changeme@localhost:5432/newscard \
  pnpm --filter @workspace/db run push

# 4. Visit the app
#    Free tool:    http://localhost:3000
#    Pro dashboard: http://localhost:3001/pro/
#    API health:    http://localhost:8080/api/health
```

## Useful Commands

```bash
# Start all services
docker-compose up -d

# View API logs
docker-compose logs -f api

# Stop all services
docker-compose down

# Stop and delete all volumes (WARNING: deletes all data)
docker-compose down -v

# Rebuild after code changes
docker-compose build --no-cache && docker-compose up -d
```
