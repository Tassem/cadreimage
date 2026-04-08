-- ============================================================
-- News Card Generator Pro — PostgreSQL Initialization
-- This script runs automatically on first container start via
-- docker-entrypoint-initdb.d (only when the data volume is empty).
-- ============================================================

-- The database and user are already created by the POSTGRES_DB /
-- POSTGRES_USER / POSTGRES_PASSWORD environment variables.
-- This file adds extensions and any setup that Drizzle push cannot handle.

-- Enable UUID generation (used for api_key generation in the app)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable full-text search support
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Nothing else: the full schema is applied by running:
--   pnpm --filter @workspace/db run push
-- after the postgres container is healthy. See docker/README.md.
