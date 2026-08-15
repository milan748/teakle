const { requireAdmin } = require('@/lib/auth');
const { checkDatabase, checkSystem, getTablesInfo, getTableSizes, getRecentActivity } = require('@/lib/health');
const { log } = require('@/lib/logger');

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const db = checkDatabase();
    const sys = checkSystem();
    const tables = getTablesInfo();
    const sizes = getTableSizes();
    const activity = getRecentActivity();

    const sizeMap = {};
    for (const s of sizes) {
      sizeMap[s.name] = s.size;
    }

    return Response.json({
      database: {
        status: db.status,
        exists: db.exists,
        path: db.path,
        size: db.size,
        lastModified: db.lastModified,
        walMode: db.walMode,
        foreignKeys: db.foreignKeys,
        tableCount: db.tableCount,
        integrity: db.integrity,
        tables: tables.map(t => ({
          name: t.name,
          rowCount: t.rowCount,
          approximateSize: sizeMap[t.name] || null,
          columns: t.columns,
        })),
      },
      system: {
        nodeVersion: sys.nodeVersion,
        platform: sys.platform,
        arch: sys.arch,
        memoryMB: Math.round(sys.memoryUsage.rss / 1024 / 1024),
        heapUsedMB: Math.round(sys.memoryUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(sys.memoryUsage.heapTotal / 1024 / 1024),
        externalMB: Math.round(sys.memoryUsage.external / 1024 / 1024),
        uptimeSeconds: Math.round(sys.uptime),
        pid: sys.pid,
      },
      activity,
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  } catch (e) {
    log.error('Admin diagnostics failed', { error: e.message });
    return Response.json({ error: 'Diagnostics failed' }, { status: 500 });
  }
}
