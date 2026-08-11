const { checkDatabase, checkSystem } = require('@/lib/health');
const { log } = require('@/lib/logger');

export async function GET() {
  try {
    const db = checkDatabase();
    const sys = checkSystem();

    const status = db.status === 'ok' ? 200 : 503;

    return Response.json({
      status: db.status === 'ok' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        status: db.status,
        exists: db.exists,
        walMode: db.walMode,
        foreignKeys: db.foreignKeys,
        tableCount: db.tableCount,
        size: db.size,
        integrity: db.integrity,
        error: db.error,
      },
      system: {
        nodeVersion: sys.nodeVersion,
        platform: sys.platform,
        arch: sys.arch,
        memoryMB: Math.round(sys.memoryUsage.rss / 1024 / 1024),
        uptimeSeconds: Math.round(sys.uptime),
      },
    }, { status });
  } catch (e) {
    log.error('Health check failed', { error: e.message });
    return Response.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: e.message,
    }, { status: 503 });
  }
}
