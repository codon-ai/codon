import { useState, useEffect } from "react";

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err);
          setData(null);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [url]);

  return { data, error, loading };
}
