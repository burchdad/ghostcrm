import { NextResponse } from 'next/server';
import { z } from 'zod';

// Simple mock data for now - can be replaced with Supabase later
const mockMarketplaceCards = [
  {
    key: 'sales-revenue-trend',
    label: 'Sales Revenue Trend',
    description: 'Track revenue trends over time with monthly, quarterly, or yearly breakdowns',
    author: 'GhostCRM Team',
    roles: ['admin', 'sales'],
    version: '1.0.0',
    rating: 4.8,
    installCount: 1547,
    theme: 'business'
  },
  {
    key: 'lead-conversion-funnel',
    label: 'Lead Conversion Funnel',
    description: 'Visualize lead progression through sales stages',
    author: 'GhostCRM Team',
    roles: ['admin', 'sales', 'marketing'],
    version: '1.2.0',
    rating: 4.6,
    installCount: 892,
    theme: 'sales'
  }
];

// GET: List marketplace cards
export async function GET(req: Request) {
  try {
    const url = new URL(req.url, 'http://localhost');
    const org = url.searchParams.get('org');
    
    // For now, return mock data
    return NextResponse.json({ 
      success: true, 
      cards: mockMarketplaceCards 
    });
  } catch (error) {
    console.error('Marketplace API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch marketplace data' 
    }, { status: 500 });
  }
}

// POST: Handle card actions
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, keys, org } = body;
    
    if (!Array.isArray(keys) || !action) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing action or keys' 
      }, { status: 400 });
    }

    // Mock responses for different actions
    if (action === 'install') {
      return NextResponse.json({ success: true, message: 'Charts installed successfully' });
    } else if (action === 'uninstall') {
      return NextResponse.json({ success: true, message: 'Charts uninstalled successfully' });
    } else if (action === 'export') {
      const exportData = mockMarketplaceCards.filter(card => keys.includes(card.key));
      return NextResponse.json({ success: true, cards: exportData });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Unknown action' 
    }, { status: 400 });
  } catch (error) {
    console.error('Marketplace API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
}
