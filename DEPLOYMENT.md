# TEAKLE — Deployment Guide

## 1. Requirements

- **Node.js** >= 18.x (tested with v24.18.0)
- **npm** >= 9.x
- **Persistent filesystem** — SQLite database and media uploads require local disk persistence
- **Reverse proxy** — nginx, Caddy, or similar for HTTPS termination

## 2. Installation

```bash
git clone <repository-url>
cd teakle
npm install
```

## 3. Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Purpose |
|----------|----------|---------|
| `SESSION_SECRET` | Yes | JWT signing secret (min 32 chars, random) |
| `ADMIN_EMAIL` | Yes | Admin login email |
| `ADMIN_PASSWORD` | Yes | Admin password (min 8 chars) |
| `DATABASE_PATH` | No | SQLite path (default: `./data/teakle.db`) |
| `MEDIA_UPLOAD_DIR` | No | Upload directory (default: `./public/uploads/media`) |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL (default: `http://localhost:3000`) |
| `NODE_ENV` | No | Set to `production` for deployment |
| `ALLOW_INSECURE_SESSION` | No | Set `true` only for HTTP local testing |
| `BACKUP_DIR` | No | Backup directory (default: `./backups`) |

Generate a secure session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Database Location

The SQLite database lives at the path specified by `DATABASE_PATH` (default: `./data/teakle.db`).

**This directory must persist across deployments.** If using Docker or a VPS, mount a persistent volume to `./data/`.

## 5. Media Storage

Uploaded media is stored in `MEDIA_UPLOAD_DIR` (default: `./public/uploads/media`).

**This directory must persist across deployments.** If using Docker or a VPS, mount a persistent volume to `./public/uploads/`.

## 6. Build

```bash
npm run build
```

This generates the `.next/` production build.

## 7. Start

```bash
npm run start
```

By default listens on port 3000. Override with `PORT` env var.

## 8. HTTPS Requirements

The application expects a **reverse proxy** (nginx, Caddy, Cloudflare, etc.) to handle HTTPS termination.

Configure the proxy to:
- Forward `X-Forwarded-Proto: https` header
- Forward `X-Forwarded-For` header
- Proxy to `http://localhost:3000`

### Sample nginx config

```nginx
server {
    listen 443 ssl http2;
    server_name teakle.in;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

## 9. Cookie Behavior

In production behind HTTPS reverse proxy:
- **Admin session cookie**: `HttpOnly`, `Secure`, `SameSite=Lax`, 24h expiry
- **Customer session cookie**: `HttpOnly`, `Secure`, `SameSite=Lax`, 30d expiry
- **CSRF cookie**: non-HttpOnly (JS-readable), `Secure`, `SameSite=Lax`, 1h expiry

`Secure` flag is automatically enabled when `X-Forwarded-Proto: https` is detected.

## 10. Backups

```bash
# Create backup
node scripts/backup-db.js

# List backups
node scripts/backup-db.js --list

# Verify a backup
node scripts/backup-db.js --verify ./backups/teakle_backup_YYYYMMDD_HHMMSS.db

# Restore from backup
node scripts/backup-db.js --restore ./backups/teakle_backup_YYYYMMDD_HHMMSS.db

# Auto-prune (keep last 10)
node scripts/backup-db.js --max-backups 10
```

Schedule daily backups via cron:
```
0 2 * * * cd /path/to/teakle && node scripts/backup-db.js --max-backups 30
```

## 11. Restore Procedure

1. Stop the application
2. Run `node scripts/backup-db.js --restore <backup-path>`
3. Verify with `node scripts/backup-db.js --verify <backup-path>`
4. Restart the application

## 12. Health Check

```bash
curl http://localhost:3000/api/health
```

Returns `{ "status": "healthy" }` or `{ "status": "degraded" }`.

## 13. Admin Setup

```bash
# Create or update admin account
ADMIN_EMAIL=admin@teakle.in ADMIN_PASSWORD=your-password node scripts/init-admin.js
```

## 14. Production Verification

```bash
# Run preflight checks
node scripts/preflight-production.js

# Run test suite
node scripts/test-sprint21.js
```

## 15. Known Limitations

### SQLite Requires Persistent Local Filesystem
- **NOT safe** for serverless deployments (Vercel, AWS Lambda, Cloudflare Workers)
- **NOT safe** for ephemeral containers without volume mounts
- **SAFE** for single-server VPS, Docker with volume mounts, or dedicated servers

### Media Uploads Require Persistent Local Filesystem
- Uploads stored on local disk at `MEDIA_UPLOAD_DIR`
- **NOT safe** for serverless or multi-instance deployments without shared storage
- For multi-instance or serverless: integrate S3/Cloudinary/etc. before deploying

### Single-Instance Only
- Rate limiting is in-memory (resets on restart, not shared between instances)
- SQLite WAL mode supports single-writer concurrency but NOT multiple application instances writing simultaneously
- **Deploy to exactly one application server**

### No Payment Processing
- Payment architecture exists but no provider is integrated
- All payment endpoints return "Payment provider not configured"
- Orders can be created but payments must be handled manually or via provider integration

### No Email
- Email architecture exists but no provider is integrated
- Password reset tokens are created but emails are not sent
