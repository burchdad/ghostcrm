import { NextRequest, NextResponse } from "next/server";
import { getAllIntegrations, searchIntegrations, getIntegrationsByCategory, getFeaturedIntegrations, getPopularIntegrations } from "@/integrations";


export const dynamic = 'force-dynamic';
// Use Node.js runtime to avoid Edge Runtime issues
export const runtime = 'nodejs';

// GET: List all available integration templates
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const popular = searchParams.get('popular');

    let filteredTemplates = getAllIntegrations();

    // Apply filters
    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => template.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower)
      );
    }

    if (featured === 'true') {
      filteredTemplates = filteredTemplates.filter(template => template.featured);
    }

    if (popular === 'true') {
      filteredTemplates = filteredTemplates.filter(template => template.popular);
    }

    // Sort by popular first, then featured, then alphabetical
    filteredTemplates.sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      templates: filteredTemplates,
      total: filteredTemplates.length,
      categories: [...new Set(getAllIntegrations().map(t => t.category))],
      stats: {
        total: getAllIntegrations().length,
        featured: getFeaturedIntegrations().length,
        popular: getPopularIntegrations().length,
        byCategory: getAllIntegrations().reduce((acc, template) => {
          acc[template.category] = (acc[template.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// GET: Get specific template by ID
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { templateId } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const template = getAllIntegrations().find(t => t.id === templateId);
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      template,
      usage: {
        installations: Math.floor(Math.random() * 1000) + 100,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
        reviews: Math.floor(Math.random() * 50) + 10
      }
    });

  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}
