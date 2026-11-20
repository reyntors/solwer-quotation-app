import { useCallback, useEffect, useState } from "react";

const EMPTY_PARAMS: Record<string, string | number> = {};

interface UseAppwriteOptions<T, P extends Record<string, string | number>> {
  fn: (params: P) => Promise<T>;
  params?: P;
  skip?: boolean;
}

interface UseAppwriteReturn<T, P> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: (newParams?: P) => Promise<void>;
}

export const useAppwrite = <T, P extends Record<string, string | number>>({
  fn,
  params = EMPTY_PARAMS as P,
  skip = false,
}: UseAppwriteOptions<T, P>): UseAppwriteReturn<T, P> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (fetchParams: P) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fn(fetchParams);
        setData(result);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";

        setError(message);
        setData(null);

        console.error("useAppwrite error:", message);
      } finally {
        setLoading(false);
      }
    },
    [fn],
  );

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }

    fetchData(params);
  }, [skip, fetchData, params]);

  const refetch = async (newParams?: P) => {
    await fetchData(newParams ?? params);
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
};
