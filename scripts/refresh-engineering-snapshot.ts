import fs from 'node:fs';
import { DASHBOARD_URL, parseDashboard } from '../src/lib/engineering/dashboard';

const SNAPSHOT_PATH = 'src/data/engineering-snapshot.json';
const TIMEOUT_MS = 15_000;

/**
 * Downloads the jts-ops dashboard, checks it is usable and rewrites the committed
 * snapshot that /engineering falls back to. Run by refresh-engineering-snapshot.yml.
 */
async function main(): Promise<void> {
  const res = await fetch(DASHBOARD_URL, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${DASHBOARD_URL} answered HTTP ${res.status}`);

  const raw: unknown = await res.json();
  const parsed = parseDashboard(raw);
  if (!parsed) throw new Error('the dashboard does not have the expected shape');
  // The snapshot is committed to a public repo: it must never carry a private repo.
  if (parsed.repos.some((r) => r.visibility !== 'public')) {
    throw new Error('the dashboard lists a non-public repo; refusing to commit it');
  }
  // Remote text reaches the Actions log below: accept only a plain UTC timestamp.
  const stamp = parsed.generated_at;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(stamp)) {
    throw new Error('the dashboard generated_at is not a UTC timestamp');
  }

  const next = `${JSON.stringify(raw, null, 2)}\n`;
  const current = fs.existsSync(SNAPSHOT_PATH) ? fs.readFileSync(SNAPSHOT_PATH, 'utf8') : '';
  if (next === current) {
    console.log(`Snapshot already up to date (${stamp}).`);
    return;
  }
  fs.writeFileSync(SNAPSHOT_PATH, next);
  console.log(`Snapshot refreshed to ${stamp} (${parsed.repos.length} repos).`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
