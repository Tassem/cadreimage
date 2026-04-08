# Docker Setup Notes

## First Run — Database Migration

After starting the stack for the first time, you must run the database migrations:

```bash
# Run migrations inside the api container
docker-compose exec api node -e "
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);
migrate(db, { migrationsFolder: './drizzle' })
  .then(() => { console.log('Migrations done'); pool.end(); })
  .catch(err => { console.error(err); process.exit(1); });
"
```

Or, if using the Replit environment:

```bash
pnpm --filter @workspace/db run db:push
```

## Services

| Service | Port | URL |
|---------|------|-----|
| API | 8080 | http://localhost:8080/api/health |
| Free Generator | 3000 | http://localhost:3000 |
| Pro Dashboard | 3001 | http://localhost:3001/pro/ |
| PostgreSQL | 5432 | postgresql://localhost:5432/newscard |

## Useful Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down

# Stop and delete volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild after code changes
docker-compose build --no-cache && docker-compose up -d
```
