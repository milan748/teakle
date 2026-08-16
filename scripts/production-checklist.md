# TEAKLE — Production Deployment Checklist

## Pre-Deployment

- [ ] Domain configured and DNS pointing to server
- [ ] HTTPS configured via reverse proxy (nginx/Caddy/Cloudflare)
- [ ] Reverse proxy forwards `X-Forwarded-Proto: https`
- [ ] Reverse proxy forwards `X-Forwarded-For`
- [ ] `SESSION_SECRET` generated (min 32 chars random)
- [ ] `ADMIN_EMAIL` configured
- [ ] `ADMIN_PASSWORD` configured (min 8 chars)
- [ ] `DATABASE_PATH` points to persistent storage
- [ ] `MEDIA_UPLOAD_DIR` points to persistent storage
- [ ] `NEXT_PUBLIC_SITE_URL` set to production HTTPS URL
- [ ] `NODE_ENV=production` set
- [ ] `.env.local` created (not committed to git)

## Build & Deploy

- [ ] `npm install` completed successfully
- [ ] `npm run build` — 0 errors, 0 warnings
- [ ] `npm run start` — server starts on expected port
- [ ] Application accessible on localhost

## Database

- [ ] `./data/` directory exists and is persistent
- [ ] Database created and migrated
- [ ] `node scripts/preflight-production.js` — integrity check passes
- [ ] Admin account created via `node scripts/init-admin.js`

## Media

- [ ] `./public/uploads/` directory exists and is persistent
- [ ] Media upload tested via admin panel

## Backups

- [ ] `./backups/` directory exists
- [ ] `node scripts/backup-db.js` — backup created successfully
- [ ] `node scripts/backup-db.js --verify` — backup verified
- [ ] Backup cron scheduled (e.g., daily at 2am)
- [ ] Restore procedure tested

## Health & Monitoring

- [ ] `/api/health` returns `{"status":"healthy"}`
- [ ] Admin diagnostics accessible (`/api/admin/diagnostics`)

## Functionality Testing

- [ ] Admin login works
- [ ] Admin dashboard loads
- [ ] Customer registration works
- [ ] Customer login works
- [ ] Product browsing works
- [ ] Cart add/update/remove works
- [ ] Checkout flow works
- [ ] Order creation works
- [ ] Order status management works
- [ ] CSV export works
- [ ] Media upload works
- [ ] CMS content editing works

## Security

- [ ] CSRF protection tested (POST without token → 403)
- [ ] Security headers present (X-Content-Type-Options, X-Frame-Options, etc.)
- [ ] API responses do not leak stack traces
- [ ] API responses do not leak SQL errors
- [ ] Passwords not logged
- [ ] Session secrets not logged
- [ ] Admin endpoints require authentication
- [ ] Rate limiting active

## Post-Deployment

- [ ] `node scripts/preflight-production.js` — all PASS
- [ ] `node scripts/test-sprint28.js` — all tests pass
- [ ] `node scripts/runtime-sprint28.js` — all runtime tests pass
- [ ] `node scripts/test-sprint29.js` — all tests pass
- [ ] `node scripts/runtime-sprint29.js` — all runtime tests pass
- [ ] Smoke test: complete purchase flow on production
- [ ] Backup verified on production

## Rollback Readiness

- [ ] Previous release tag / commit recorded
- [ ] Rollback (git checkout + rebuild) procedure documented
- [ ] Fresh backup taken before any database restore
- [ ] Media directory preserved during rollback
- [ ] `.env.local` preserved during rollback
- [ ] `node scripts/backup-db.js --restore` tested in staging

## Logging & Monitoring

- [ ] systemd journald rotation configured (or `pm2-logrotate` installed)
- [ ] Log access verified (`journalctl -u teakle` / `pm2 logs`)
- [ ] `/api/health` polled by external monitor
- [ ] Alerts configured for `degraded`/`unhealthy` status (HTTP 503)

