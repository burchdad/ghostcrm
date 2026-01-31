"use client";

import React from "react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";

export default function MarketingHeader() {
  const { isMobile, isTablet } = useDeviceDetection();

  // Show mobile header for mobile and tablet devices
  if (isMobile || isTablet) {
    return <MobileHeader />;
  }

  // Show desktop header for desktop devices
  return <DesktopHeader />;
}