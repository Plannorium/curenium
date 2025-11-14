import { useState, useEffect } from 'react';

export function useWindowSize() {
  const [size, setSize] = useState([
    typeof window !== 'undefined' ? window.innerWidth : 1280,
    typeof window !== 'undefined' ? window.innerHeight : 800,
  ]);

  useEffect(() => {
    const handleResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width: size[0],
    height: size[1],
  };
}