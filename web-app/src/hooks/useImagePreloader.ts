import { useState, useEffect } from 'react';

export const useImagePreloader = (urls: string[]) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let loadedCount = 0;

    const loadImage = (url: string) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === urls.length) {
          setIsReady(true);
        }
      };
    };

    urls.forEach(loadImage);
  }, [urls]);

  return isReady;
};