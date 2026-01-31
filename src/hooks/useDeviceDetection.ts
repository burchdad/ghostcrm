"use client";

import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function useDeviceDetection() {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
      
      setIsLoading(false);
    };

    // Initial detection
    detectDevice();

    // Listen for window resize
    const handleResize = () => {
      detectDevice();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet', 
    isDesktop: deviceType === 'desktop',
    isMobileOrTablet: deviceType === 'mobile' || deviceType === 'tablet',
    isLoading
  };
}

// Utility hook for simple mobile/desktop detection
export function useIsMobile() {
  const { isMobile, isLoading } = useDeviceDetection();
  return { isMobile, isLoading };
}