/**
 * Connection string for Postgres (CLI + app). Keep fallbacks aligned with deployment env vars.
 */
export function getDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL ??
    process.env.DEV_DATABASE_URL ??
    process.env.PROD_DATABASE_URL ??
    process.env.DATABASE_POSTGRES_URL;
  if (!url?.trim()) {
    throw new Error(
      "Set DATABASE_URL in .env (or DEV_DATABASE_URL / PROD_DATABASE_URL / DATABASE_POSTGRES_URL).",
    );
  }
  return url;
}
