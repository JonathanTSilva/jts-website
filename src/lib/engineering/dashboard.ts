import snapshot from '../../data/engineering-snapshot.json';

export const DASHBOARD_URL = 'https://jonathantsilva.github.io/jts-ops/dashboard.json';
export const HANDBOOK_URL = 'https://github.com/JonathanTSilva/.github/tree/main/handbook';
const GITHUB_OWNER = 'JonathanTSilva';
const FETCH_TIMEOUT_MS = 10_000;

export interface DashboardRepo {
  name: string;
  visibility: string;
  archived: boolean;
  status: string;
  ci: string | null;
  compliant: boolean;
  /** Inventory profile; `special` repos (org defaults, profile README) are not listed. */
  profile: string | null;
  /** Which badges apply to the repo. Absent in older dashboard data, which means all of them. */
  badges: BadgeFlags;
}

interface BadgeFlags {
  coverage: boolean;
  quality: boolean;
  release: boolean;
}

interface DashboardSummary {
  total: number;
  compliant: number;
  percent: number;
  ci_green: number;
  ci_total: number;
}

export interface Dashboard {
  generated_at: string;
  summary: DashboardSummary;
  repos: DashboardRepo[];
}

export interface LoadedDashboard {
  data: Dashboard;
  source: 'live' | 'snapshot';
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const ALL_BADGES: BadgeFlags = { coverage: true, quality: true, release: true };

/** Missing or non-boolean flags count as true, so data without `badges` renders as before. */
function parseBadges(v: unknown): BadgeFlags {
  if (!isRecord(v)) return { ...ALL_BADGES };
  return {
    coverage: v.coverage !== false,
    quality: v.quality !== false,
    release: v.release !== false,
  };
}

/** Keeps only what the page reads. Returns null when the shape is not usable. */
export function parseDashboard(input: unknown): Dashboard | null {
  if (!isRecord(input) || typeof input.generated_at !== 'string') return null;
  const s = input.summary;
  if (
    !isRecord(s) ||
    !isNumber(s.total) ||
    !isNumber(s.compliant) ||
    !isNumber(s.percent) ||
    !isNumber(s.ci_green) ||
    !isNumber(s.ci_total)
  ) {
    return null;
  }
  if (!Array.isArray(input.repos)) return null;

  const repos: DashboardRepo[] = [];
  for (const r of input.repos) {
    if (
      !isRecord(r) ||
      typeof r.name !== 'string' ||
      typeof r.visibility !== 'string' ||
      typeof r.archived !== 'boolean' ||
      typeof r.status !== 'string' ||
      typeof r.compliant !== 'boolean' ||
      !(r.ci === null || typeof r.ci === 'string') ||
      !(r.profile === undefined || r.profile === null || typeof r.profile === 'string')
    ) {
      return null;
    }
    repos.push({
      name: r.name,
      visibility: r.visibility,
      archived: r.archived,
      status: r.status,
      ci: r.ci,
      compliant: r.compliant,
      profile: r.profile ?? null,
      badges: parseBadges(r.badges),
    });
  }

  return {
    generated_at: input.generated_at,
    summary: {
      total: s.total,
      compliant: s.compliant,
      percent: s.percent,
      ci_green: s.ci_green,
      ci_total: s.ci_total,
    },
    repos,
  };
}

/** Makes a fallback visible: a `::warning::` annotation in GitHub Actions, a console warning elsewhere. */
function warnFallback(reason: string, snapshotDate: string): void {
  const message = `/engineering is built from the committed snapshot (${snapshotDate || 'no date'}), not live data: ${reason}`.replace(
    /\s+/g,
    ' ',
  );
  if (process.env.GITHUB_ACTIONS === 'true') {
    console.log(`::warning title=Engineering dashboard fallback::${message}`);
  } else {
    console.warn(`[engineering] ${message}`);
  }
}

/**
 * Fetches the live dashboard and falls back to the committed snapshot on any
 * failure (network, timeout, HTTP error, bad JSON, bad shape), with a build
 * warning that names the reason. Never throws.
 */
export async function loadDashboard(
  fetchImpl: typeof fetch = fetch,
  url: string = DASHBOARD_URL,
): Promise<LoadedDashboard> {
  let reason: string;
  try {
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (res.ok) {
      const live = parseDashboard(await res.json());
      if (live) return { data: live, source: 'live' };
      reason = 'unexpected data shape';
    } else {
      reason = `HTTP ${res.status}`;
    }
  } catch (err) {
    reason = err instanceof Error ? `${err.name}: ${err.message}` : 'unknown error';
  }
  const fallback = parseDashboard(snapshot);
  warnFallback(reason, fallback?.generated_at ?? '');
  if (!fallback) {
    // The committed snapshot is part of the repo and tested; this is a last resort.
    return {
      data: {
        generated_at: '',
        summary: { total: 0, compliant: 0, percent: 0, ci_green: 0, ci_total: 0 },
        repos: [],
      },
      source: 'snapshot',
    };
  }
  return { data: fallback, source: 'snapshot' };
}

let cached: Promise<LoadedDashboard> | undefined;

/** One fetch per build, shared by the English and Portuguese pages. */
export function getDashboard(): Promise<LoadedDashboard> {
  cached ??= loadDashboard();
  return cached;
}

/** Public, non-archived, non-special repos: the only ones that get a row and badges. */
export function listedRepos(data: Dashboard): DashboardRepo[] {
  return data.repos
    .filter((r) => r.visibility === 'public' && !r.archived && r.profile !== 'special')
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function archivedPublicCount(data: Dashboard): number {
  return data.repos.filter((r) => r.visibility === 'public' && r.archived).length;
}

interface RepoLinks {
  repo: string;
  coverage: string;
  quality: string;
  scorecard: string;
  release: string;
}

export interface RepoBadges extends RepoLinks {
  coverageImg: string;
  qualityImg: string;
  scorecardImg: string;
  releaseImg: string;
}

/** Badge and link URLs for one public repo. Callers must only pass public repos. */
export function repoBadges(name: string, owner: string = GITHUB_OWNER): RepoBadges {
  const slug = encodeURIComponent(name);
  const sonarKey = encodeURIComponent(`${owner}_${name}`);
  const gh = `https://github.com/${owner}/${slug}`;
  return {
    repo: gh,
    coverage: `https://app.codecov.io/gh/${owner}/${slug}`,
    quality: `https://sonarcloud.io/summary/overall?id=${sonarKey}`,
    scorecard: `https://scorecard.dev/viewer/?uri=github.com/${owner}/${slug}`,
    release: `${gh}/releases`,
    coverageImg: `https://codecov.io/gh/${owner}/${slug}/graph/badge.svg`,
    qualityImg: `https://sonarcloud.io/api/project_badges/measure?project=${sonarKey}&metric=alert_status`,
    scorecardImg: `https://img.shields.io/ossf-scorecard/github.com/${owner}/${slug}?style=flat-square&label=scorecard`,
    releaseImg: `https://img.shields.io/github/v/release/${owner}/${slug}?style=flat-square&display_name=tag&sort=semver`,
  };
}
