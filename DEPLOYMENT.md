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
| `SESSION_SECRET` | Yes | JWT signing secret (min 32 chars, random). Used for admin sessions. |
| `ADMIN_SESSION_SECRET` | No | Separate admin JWT secret. Falls back to `SESSION_SECRET` if not set. Recommended for production. |
| `CUSTOMER_SESSION_SECRET` | No | Separate customer JWT secret. Falls back to `SESSION_SECRET` if not set. Recommended for production. |
| `ADMIN_EMAIL` | Yes | Admin login email |
| `ADMIN_PASSWORD` | Yes | Admin password (min 8 chars) |
| `DATABASE_PATH` | No | SQLite path (default: `./data/teakle.db`) |
| `MEDIA_UPLOAD_DIR` | No | Upload directory (default: `./public/uploads/media`) |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL (default: `http://localhost:3000`) |
| `NODE_ENV` | No | Set to `production` for deployment |
| `ALLOW_INSECURE_SESSION` | No | Set `true` only for HTTP local testing |
| `BACKUP_DIR` | No | Backup directory (default: `./backups`) |
| `EMAIL_PROVIDER` | No | Email provider: `none`, `resend`, `sendgrid` (default: `none`) |
| `EMAIL_FROM` | No | Sender email address |
| `EMAIL_API_KEY` | No | Email provider API key |
| `PAYMENT_PROVIDER` | No | Payment provider: `none`, `razorpay`, `stripe` (default: `none`) |
| `PAYMENT_KEY_ID` | No | Payment provider public key |
| `PAYMENT_KEY_SECRET` | No | Payment provider secret key |
| `PAYMENT_WEBHOOK_SECRET` | No | Webhook signature verification secret |

Generate a secure session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
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

## 8. Process Management

For production, use a process manager to keep the app running and restart on crashes.

### systemd (Linux)

Create `/etc/systemd/system/teakle.service`:
```ini
[Unit]
Description=Teakle E-commerce
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/teakle
# The process ultimately runs `npm run start` (= `next start`).
# PATH is set explicitly because the systemd environment is minimal.
Environment=NODE_ENV=production
Environment=PATH=/usr/local/bin:/usr/bin:/bin
EnvironmentFile=/path/to/teakle/.env.local
ExecStart=/usr/bin/npm --prefix /path/to/teakle run start
Restart=on-failure
RestartSec=5
# Graceful shutdown: allow in-flight requests to finish.
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
```

```bash
# Reload systemd after editing the unit file
sudo systemctl daemon-reload
sudo systemctl enable teakle
sudo systemctl start teakle
sudo systemctl status teakle

# View logs
sudo journalctl -u teakle -f
```

**Filesystem permissions:** The service user (`www-data`) must be able to **read and write** the following directories. Create them and set ownership before starting the service:

```bash
sudo mkdir -p /path/to/teakle/data
sudo mkdir -p /path/to/teakle/public/uploads/media
sudo mkdir -p /path/to/teakle/backups
sudo chown -R www-data:www-data /path/to/teakle/data
sudo chown -R www-data:www-data /path/to/teakle/public/uploads
sudo chown -R www-data:www-data /path/to/teakle/backups
```

The application also creates these directories automatically on first run if they are missing, but the parent paths must be writable by the service user.

### PM2 (Node.js)

```bash
npm install -g pm2
pm2 start npm --name "teakle" -- start
pm2 save
pm2 startup
```

View logs:
```bash
pm2 logs teakle
```

**Important:** Configure log rotation to avoid unbounded disk usage:
```bash
pm2 install pm2-logrotate
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Run with persistent volumes so the database and uploads survive container restarts:
```bash
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  --name teakle \
  -v teakle-data:/app/data \
  -v teakle-uploads:/app/public/uploads/media \
  -v teakle-backups:/app/backups \
  teakle:latest
```

**Important:** This is a single-instance application. Do NOT scale to multiple replicas — SQLite and in-memory rate limiting do not support it.

## 9. HTTPS Requirements

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

## 10. Cookie Behavior

In production behind HTTPS reverse proxy:
- **Admin session cookie**: `HttpOnly`, `Secure`, `SameSite=Lax`, 24h expiry
- **Customer session cookie**: `HttpOnly`, `Secure`, `SameSite=Lax`, 30d expiry
- **CSRF cookie**: non-HttpOnly (JS-readable), `Secure`, `SameSite=Lax`, 1h expiry

`Secure` flag is automatically enabled when `X-Forwarded-Proto: https` is detected.

## 11. Backups

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

## 12. Restore Procedure

1. Stop the application
2. Run `node scripts/backup-db.js --restore <backup-path>`
3. Verify with `node scripts/backup-db.js --verify <backup-path>`
4. Restart the application

A pre-restore safety backup (`teakle_pre_restore_*.db`) is created automatically in `BACKUP_DIR` before any restore, and the restore is rolled back if it fails.

## 13. Rollback Procedure

TEAKLE is a stateful, single-instance application. A safe rollback covers code, database, media, and environment.

### Code / Git rollback
```bash
cd /path/to/teakle
# Stop the running service
sudo systemctl stop teakle        # (or: pm2 stop teakle)

# Restore the previous commit
git fetch --all
git checkout <previous-release-tag>

# Rebuild with the rolled-back source
npm install
npm run build
```

### Database rollback
```bash
# 1. Always take a fresh backup BEFORE restoring an old database
node scripts/backup-db.js

# 2. Restore the matching pre-migration backup (schema must match the rolled-back code)
node scripts/backup-db.js --restore ./backups/teakle_backup_YYYYMMDD_HHMMSS.db
node scripts/backup-db.js --verify ./backups/teakle_backup_YYYYMMDD_HHMMSS.db
```

> Database migrations are additive and idempotent. Rolling *forward* to the latest code after a DB restore is safe. Rolling *back* the code while keeping a newer database with extra columns is also safe (old code ignores unknown columns). Only restore an older database if you specifically need to undo data changes.

### Media preservation
Uploaded media in `MEDIA_UPLOAD_DIR` is **not** affected by code or database rollbacks. Do not delete `public/uploads/media` during a rollback.

### Environment preservation
`.env.local` is outside version control and is **not** changed by `git checkout`. Keep it intact across rollbacks. Only update it if a release explicitly requires new variables.

### Restart
```bash
sudo systemctl start teakle       # (or: pm2 start teakle)
```

## 14. Health Check

```bash
curl http://localhost:3000/api/health
```

Returns `{ "status": "healthy" }` or `{ "status": "degraded" }` (HTTP 503 when degraded).

For monitoring, poll this endpoint. It reports database status, table counts, and provider configuration **without exposing secrets or filesystem paths**.

Admin-only diagnostics (per-table row counts, filesystem DB path, recent activity) are available at:
```bash
curl -H "Authorization: Bearer <admin-jwt>" http://localhost:3000/api/admin/diagnostics
```

## 15. Logging

The application uses structured logging to `stdout`/`stderr` (no log files are written by the app itself).

- **systemd:** logs are captured by `journald`. View with `sudo journalctl -u teakle -f`. Configure rotation via `/etc/systemd/journald.conf` (`SystemMaxUse`, `SystemKeepFree`).
- **PM2:** logs are written to `~/.pm2/logs/teakle-*.log`. Enable `pm2-logrotate` to bound disk usage.
- **Docker:** `docker logs teakle`.

Sensitive values (passwords, tokens, secrets, API keys) are redacted automatically in all log output.

## 16. Admin Setup

```bash
# Create or update admin account
ADMIN_EMAIL=admin@teakle.in ADMIN_PASSWORD=your-password node scripts/init-admin.js
```

## 17. Production Verification

```bash
# Run preflight checks
node scripts/preflight-production.js

# Run test suites
node scripts/test-sprint26.js
node scripts/test-sprint29.js
```

## 18. Known Limitations

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
