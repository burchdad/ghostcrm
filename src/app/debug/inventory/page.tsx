/**
 * Inventory Debug Page
 * Testing interface for inventory system
 */

import { Suspense } from 'react';
import InventoryDebugComponent from '@/components/debug/InventoryDebugComponent';

export const metadata = {
  title: 'Inventory Debug Console - GhostCRM',
  description: 'Debug and test inventory system functionality',
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading inventory debug console...</p>
      </div>
    </div>
  );
}

export default function InventoryDebugPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InventoryDebugComponent />
    </Suspense>
  );
}