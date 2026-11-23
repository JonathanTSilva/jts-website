import type { LoadedDashboard } from './dashboard';

export interface DataStamp {
  generated_at: string;
  source: 'live' | 'snapshot';
}

/** What `/engineering/data.json` publishes: which data this build used, nothing else. */
export function dataStamp({ data, source }: LoadedDashboard): DataStamp {
  return { generated_at: data.generated_at, source };
}
