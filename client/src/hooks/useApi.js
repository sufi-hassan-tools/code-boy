import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function useApi(apiFn, ...params) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortCtrl = useRef(null);

  useEffect(() => {
    abortCtrl.current = new AbortController();
    setLoading(true);
    apiFn(...params, { signal: abortCtrl.current.signal })
      .then(res => setData(res.data || res))
      .catch(err => { if (!axios.isCancel(err)) setError(err); })
      .finally(() => setLoading(false));
    return () => abortCtrl.current.abort();
  }, [apiFn, ...params]);

  return { data, loading, error };
}
