# Backups y restore

Backup diario automatizado de la base de datos de Amantis con retención de 30 días en Cloudflare R2.

## Cómo funciona

1. Un servicio cron en Railway corre `pnpm backup` cada día a las **05:00 UTC** (≈ 23:00 CDT del día anterior).
2. El script (`scripts/backup-db.ts`) ejecuta `pg_dump --format=custom --no-owner --no-acl`, lo comprime con gzip en streaming y lo sube a R2 como `backups/amantis-YYYY-MM-DD-HHmm.sql.gz`.
3. Después del upload, lista el prefijo `backups/` y elimina cualquier objeto cuya fecha de última modificación sea mayor a 30 días.
4. Si `pg_dump` falla o el dump pesa < 1 KiB, el job aborta sin tocar R2 (evita pisar buenos backups con uno vacío).

## Setup de Railway (una sola vez)

1. En el proyecto de Railway crea un servicio nuevo de tipo **Cron**.
2. Apunta el servicio al mismo repo (`amantis-shop`) y rama (`main`).
3. **Schedule:** `0 5 * * *`
4. **Start command:** `pnpm backup`
5. **Variables de entorno** (heredables o duplicadas del servicio principal):
   - `DATABASE_URL` (la URL **interna** de Railway: `postgres.railway.internal`)
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
   - `R2_BACKUPS_BUCKET` (nombre del bucket dedicado, p.ej. `amantis-backups`)
6. Asegurarse de que la imagen del builder incluya `pg_dump`. Railway con Nixpacks lo agrega automáticamente cuando ve `tsx` + un script que lo invoca; si falla, añadir un `nixpacks.toml` con `pkgs = ["postgresql_16"]`.

## R2 bucket

- Crear un bucket dedicado en Cloudflare R2 llamado `amantis-backups`.
- **No** habilitar acceso público (los dumps no deben servirse por HTTP).
- Las credenciales R2 existentes (las que usa la app para imágenes) sirven mientras tengan permiso de Object Read/Write sobre este bucket. Si se prefiere aislamiento total, crear un API token nuevo restringido a `amantis-backups` y usarlo solo en el servicio cron.

## Probar manualmente desde local

```bash
# Dry-run: ejecuta pg_dump pero no sube nada ni borra nada en R2.
pnpm backup:dry

# Subida real (asegúrate de tener DATABASE_URL apuntando a Railway y
# R2_BACKUPS_BUCKET configurado en .env.local).
pnpm backup
```

## Restore

1. Descargar el backup deseado de R2 (Cloudflare dashboard o `wrangler r2 object get`):
   ```bash
   wrangler r2 object get amantis-backups/backups/amantis-2026-04-29-0500.sql.gz \
     --file amantis-2026-04-29.sql.gz
   ```
2. Descomprimir y restaurar a una base de datos vacía:
   ```bash
   gunzip < amantis-2026-04-29.sql.gz | \
     pg_restore --no-owner --no-acl --clean --if-exists \
       -d "postgresql://USER:PASS@HOST:PORT/DBNAME"
   ```
   - `--clean --if-exists` borra los objetos existentes antes de recrearlos. Útil para restaurar sobre una base ya poblada.
   - Para restaurar a una DB local vacía, primero `createdb amantis_restore` y apunta `-d` ahí.
3. Verificar que las tablas críticas tengan filas:
   ```sql
   SELECT count(*) FROM "Product";
   SELECT count(*) FROM "Category";
   SELECT count(*) FROM "User";
   ```

## Smoke test obligatorio antes de marcar el ticket Done

Tomar el backup más reciente y restaurarlo a una DB local nueva para confirmar que el dump no está corrupto. Si el restore falla, **revertir el ticket a In Progress** hasta resolver.

## Recuperación ante incidente

- Si un backup falla, Railway notifica vía su sistema de alertas del servicio cron.
- Si la DB de Railway se corrompe o se borra:
  1. Crear nueva instancia Postgres en Railway.
  2. Tomar el backup más reciente válido de R2.
  3. Ejecutar el restore contra la nueva DB.
  4. Apuntar `DATABASE_URL` al nuevo host.
  5. Redeploy de la app.
