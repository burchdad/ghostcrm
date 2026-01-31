"use client";

import { ReactNode } from 'react';

interface CoreLayoutProps {
  children: ReactNode;
}

export default function CoreLayout({ children }: CoreLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}