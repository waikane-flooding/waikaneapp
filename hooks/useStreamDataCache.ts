import { useState, useCallback, useRef } from 'react';

// Cache structure for stream data
interface StreamDataCache {
  waikane?: {
    data: any[];
    trends: any[];
    lastFetch: number;
  };
  waiahole?: {
    data: any[];
    trends: any[];
    lastFetch: number;
  };
  punaluu?: {
    data: any[];
    trends: any[];
    lastFetch: number;
  };
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const useStreamDataCache = () => {
  const cacheRef = useRef<StreamDataCache>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  const fetchStreamData = useCallback(async (streamType: 'waikane' | 'waiahole' | 'punaluu') => {
    const now = Date.now();
    const cached = cacheRef.current[streamType];
    
    // Return cached data if it's still fresh
    if (cached && (now - cached.lastFetch) < CACHE_DURATION) {
      return cached;
    }

    // Prevent multiple simultaneous requests for the same stream
    if (isLoading[streamType]) {
      return cached || null;
    }

    setIsLoading(prev => ({ ...prev, [streamType]: true }));

    try {
      const apiEndpoints = {
        waikane: 'waikane_stream',
        waiahole: 'waiahole_stream', 
        punaluu: 'punaluu_stream'
      };

      const [streamRes, trendRes] = await Promise.all([
        fetch(`http://149.165.159.226:5000/api/${apiEndpoints[streamType]}`),
        fetch('http://149.165.159.226:5000/api/stream_trend')
      ]);

      const streamData = await streamRes.json();
      const trendData = await trendRes.json();

      const result = {
        data: streamData,
        trends: trendData,
        lastFetch: now
      };

      // Cache the result
      cacheRef.current[streamType] = result;
      
      return result;
    } catch {
      return cached || null;
    } finally {
      setIsLoading(prev => ({ ...prev, [streamType]: false }));
    }
  }, [isLoading]);

  const clearCache = useCallback((streamType?: 'waikane' | 'waiahole' | 'punaluu') => {
    if (streamType) {
      delete cacheRef.current[streamType];
    } else {
      cacheRef.current = {};
    }
  }, []);

  const isStreamLoading = useCallback((streamType: 'waikane' | 'waiahole' | 'punaluu') => {
    return !!isLoading[streamType];
  }, [isLoading]);

  return {
    fetchStreamData,
    clearCache,
    isStreamLoading
  };
};