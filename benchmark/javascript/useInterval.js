import { useRef, useEffect } from "react";

export function useInterval(callback, delayMs) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs !== null) {
      const id = setInterval(() => {
        savedCallback.current();
      }, delayMs);
      return () => clearInterval(id);
    }
  }, [delayMs]);
}
