import type { APIRoute } from 'astro';
import { getDashboard } from '../../lib/engineering/dashboard';
import { dataStamp } from '../../lib/engineering/dataStamp';

/**
 * The data stamp this build used, fetchable after deploy. engineering-refresh.yml
 * compares it with the live dashboard to decide whether the site needs a rebuild.
 */
export const GET: APIRoute = async () =>
  new Response(`${JSON.stringify(dataStamp(await getDashboard()))}\n`, {
    headers: { 'Content-Type': 'application/json' },
  });
