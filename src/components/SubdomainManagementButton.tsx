'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Settings } from 'lucide-react';
import SubdomainManager from '@/components/SubdomainManager';

interface SubdomainManagementButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export default function SubdomainManagementButton({ 
  variant = 'default', 
  size = 'default',
  className = ''
}: SubdomainManagementButtonProps) {
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsManagerOpen(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <Globe className="h-4 w-4" />
        Manage Subdomains
        <Settings className="h-4 w-4" />
      </Button>

      <SubdomainManager
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
      />
    </>
  );
}