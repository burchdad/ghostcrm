"use client";
import React, { useEffect, useRef, useState } from "react";

export default function Topbar() {
  // Shell state
  const [org, setOrg] = useState("All");
  const [userRole] = useState("admin");
  
  // Title on Topbar
  return (
    <div className="w-full h-12 flex items-center gap-3 px-2 md:px-4 overflow-x-auto relative">
      <div className="flex items-center gap-2 shrink-0">
        {/* Logo/Icon placeholder */}
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-blue-700 text-xl mr-2">
          {/* Replace with your logo or icon */}
          <span>🚗</span>
        </div>
        <span className="font-bold text-lg text-blue-700 whitespace-nowrap">GHOST AUTO CRM</span>
      </div>
    </div>
  );
}
