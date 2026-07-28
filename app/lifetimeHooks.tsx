import { useRef, useEffect } from 'react'

export const useUnload = (fn: (event: BeforeUnloadEvent) => void) => {
  const cb = useRef(fn);

  useEffect(() => {
    const onUnload = cb.current;
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [cb]);
};