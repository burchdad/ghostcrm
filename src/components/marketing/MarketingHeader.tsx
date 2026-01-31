"use client";

import React from "react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";

export default function MarketingHeader() {
  const { isMobile, isTablet, isDesktop, deviceType, isLoading } = useDeviceDetection();

  // Debug logging
  console.log('📱 [MarketingHeader] Device Detection:', {
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    isLoading,
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'server'
  });

  // During loading state, show desktop header to prevent flash
  if (isLoading) {
    return <DesktopHeader />;
  }

  // Show mobile header for mobile and tablet devices
  if (isMobile || isTablet) {
    return <MobileHeader />;
  }

  // Show desktop header for desktop devices
  return <DesktopHeader />;
}