// Utility functions for updating sidebar counts in real-time

interface CountUpdateData {
  action: 'increment' | 'decrement' | 'set';
  type: 'leads' | 'deals' | 'inventory' | 'calendar' | 'finance';
  value?: number; // For 'set' action
}

/**
 * Update sidebar counts when actions are performed
 * Call this function when:
 * - A lead is created/deleted
 * - A deal is created/closed
 * - Inventory items are added/removed
 * - Calendar events are scheduled/cancelled
 * - Financial items require attention
 */
export async function updateSidebarCount(data: CountUpdateData): Promise<boolean> {
  try {
    const response = await fetch('/api/sidebar/counts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (result.success) {
      // Optionally trigger a custom event to update sidebar without full refresh
      window.dispatchEvent(new CustomEvent('sidebarCountsUpdated', { 
        detail: result.data 
      }));
      return true;
    } else {
      console.error('Failed to update sidebar count:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error updating sidebar count:', error);
    return false;
  }
}

/**
 * Convenience functions for common actions
 */
export const sidebarCounts = {
  // Lead actions
  leadCreated: () => updateSidebarCount({ action: 'increment', type: 'leads' }),
  leadDeleted: () => updateSidebarCount({ action: 'decrement', type: 'leads' }),
  
  // Deal actions  
  dealCreated: () => updateSidebarCount({ action: 'increment', type: 'deals' }),
  dealClosed: () => updateSidebarCount({ action: 'decrement', type: 'deals' }),
  
  // Inventory actions
  inventoryAdded: (count = 1) => updateSidebarCount({ action: 'increment', type: 'inventory' }),
  inventoryRemoved: (count = 1) => updateSidebarCount({ action: 'decrement', type: 'inventory' }),
  
  // Calendar actions
  eventScheduled: () => updateSidebarCount({ action: 'increment', type: 'calendar' }),
  eventCancelled: () => updateSidebarCount({ action: 'decrement', type: 'calendar' }),
  
  // Finance actions
  financeItemAdded: () => updateSidebarCount({ action: 'increment', type: 'finance' }),
  financeItemResolved: () => updateSidebarCount({ action: 'decrement', type: 'finance' }),
};

/**
 * Force refresh sidebar counts
 */
export async function refreshSidebarCounts(): Promise<void> {
  try {
    const response = await fetch('/api/sidebar/counts');
    const result = await response.json();
    
    if (result.success) {
      window.dispatchEvent(new CustomEvent('sidebarCountsUpdated', { 
        detail: result.data 
      }));
    }
  } catch (error) {
    console.error('Error refreshing sidebar counts:', error);
  }
}