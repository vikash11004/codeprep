import { useState, useEffect, useCallback } from 'react';
import { api, getSessionId } from '../utils/api';

export function useSession() {
  const [sessionId] = useState(getSessionId);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshSummary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getSessionSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch session summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  return { sessionId, summary, loading, refreshSummary };
}
