// Explicit offline empty state for this extracted homepage. No network requests.
interface StatsSummary {
  total: number;
  passed: number;
  photoCheckComplete: number;
  retakeRequested: number;
  manualReview: number;
  inProgress: number;
  published: number;
  visionConfigured: boolean;
}

interface CheckSummary {
  id: string;
  profileName: string;
  status: string;
  askingPrice: number;
  currency: string;
  createdAt: string;
  publishedAt: string | null;
}

interface QueryResult<T> {
  data: T;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

const stats: StatsSummary = {
  total: 0,
  passed: 0,
  photoCheckComplete: 0,
  retakeRequested: 0,
  manualReview: 0,
  inProgress: 0,
  published: 0,
  visionConfigured: false,
};

export const getGetStatsSummaryQueryKey = () => ["/api/stats/summary"] as const;
export const getListChecksQueryKey = (params: { limit?: number }) => ["/api/checks", params] as const;

export function useGetStatsSummary(_options?: unknown): QueryResult<StatsSummary> {
  return { data: stats, isLoading: false, isError: false, error: null, refetch: () => {} };
}

export function useListChecks(_params?: { limit?: number }, _options?: unknown): QueryResult<CheckSummary[]> {
  return { data: [], isLoading: false, isError: false, error: null, refetch: () => {} };
}
