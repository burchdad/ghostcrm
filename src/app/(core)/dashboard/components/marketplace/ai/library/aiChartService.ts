import { 
  AIChartRequest, 
  AIChartResponse, 
  ChartTemplate, 
  OrganizationalChartTemplate,
  ChartType 
} from './types';
import { OrganizationalChartRegistry, getCurrentUserContext } from './organizationalRegistry';

// AI Chart Generation Service
export class AIChartService {
  private static instance: AIChartService;
  
  private constructor() {}
  
  public static getInstance(): AIChartService {
    if (!AIChartService.instance) {
      AIChartService.instance = new AIChartService();
    }
    return AIChartService.instance;
  }

  public async generateChart(request: AIChartRequest): Promise<AIChartResponse> {
    try {
      const userContext = getCurrentUserContext();
      
      // Step 1: Analyze the prompt and generate chart suggestions
      const suggestions = await this.analyzePromptAndGenerateCharts(request);
      
      if (suggestions.length === 0) {
        return {
          success: false,
          error: 'Unable to generate charts from the provided prompt',
          suggestions: []
        };
      }

      // Step 2: Select the best chart template
      const selectedChart = suggestions[0]; // For now, take the first/best suggestion
      
      // Step 3: If user wants to save to organization, create organizational chart
      if (request.options.saveToOrganization) {
        const orgRegistry = OrganizationalChartRegistry.getInstance(userContext.organizationId);
        const orgChart = await orgRegistry.saveAIChart(
          request, 
          selectedChart,
          userContext.userId,
          {
            name: userContext.userName,
            email: userContext.userEmail,
            role: userContext.userRole
          }
        );

        return {
          success: true,
          chartTemplate: orgChart,
          suggestions: suggestions.slice(1) // Return other suggestions as alternatives
        };
      }

      return {
        success: true,
        chartTemplate: selectedChart as OrganizationalChartTemplate,
        suggestions: suggestions.slice(1)
      };

    } catch (error) {
      console.error('AI Chart Generation Error:', error);
      return {
        success: false,
        error: `Failed to generate chart: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestions: []
      };
    }
  }

  private async analyzePromptAndGenerateCharts(request: AIChartRequest): Promise<ChartTemplate[]> {
    const prompt = request.prompt.toLowerCase();
    const suggestions: ChartTemplate[] = [];

    // Analyze prompt keywords to determine chart type and category
    const chartAnalysis = this.analyzePromptForChartType(prompt);
    
    // Generate base chart configuration
    const baseChart = this.createBaseChartFromAnalysis(chartAnalysis, request);
    
    if (baseChart) {
      suggestions.push(baseChart);
      
      // Generate alternative chart types
      const alternatives = this.generateAlternativeCharts(chartAnalysis, request);
      suggestions.push(...alternatives);
    }

    return suggestions;
  }

  private analyzePromptForChartType(prompt: string): {
    type: ChartType;
    category: string;
    confidence: number;
    keywords: string[];
    dataHints: string[];
  } {
    const chartKeywords = {
      bar: ['bar', 'compare', 'comparison', 'categories', 'versus', 'vs'],
      line: ['trend', 'over time', 'timeline', 'progress', 'growth', 'change'],
      pie: ['distribution', 'percentage', 'proportion', 'share', 'breakdown'],
      doughnut: ['composition', 'parts', 'segments', 'breakdown'],
      scatter: ['correlation', 'relationship', 'scatter', 'xy', 'plot'],
      radar: ['performance', 'multiple metrics', 'comparison', 'spider', 'radar'],
      area: ['volume', 'cumulative', 'stacked', 'total']
    };

    const categoryKeywords = {
      sales: ['sales', 'revenue', 'deals', 'pipeline', 'quota', 'commission'],
      marketing: ['campaign', 'leads', 'conversion', 'roi', 'marketing', 'funnel'],
      analytics: ['users', 'behavior', 'engagement', 'traffic', 'analytics'],
      finance: ['budget', 'expenses', 'profit', 'cash flow', 'financial'],
      operations: ['productivity', 'efficiency', 'tasks', 'performance', 'operations']
    };

    // Determine chart type
    let bestType: ChartType = 'bar';
    let bestScore = 0;
    
    for (const [type, keywords] of Object.entries(chartKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (prompt.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > bestScore) {
        bestScore = score;
        bestType = type as ChartType;
      }
    }

    // Determine category
    let bestCategory = 'analytics';
    let bestCategoryScore = 0;
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (prompt.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > bestCategoryScore) {
        bestCategoryScore = score;
        bestCategory = category;
      }
    }

    return {
      type: bestType,
      category: bestCategory,
      confidence: Math.min((bestScore + bestCategoryScore) * 0.2, 0.95),
      keywords: prompt.split(' ').filter(word => word.length > 3),
      dataHints: this.extractDataHints(prompt)
    };
  }

  private extractDataHints(prompt: string): string[] {
    const hints: string[] = [];
    
    // Time-based hints
    if (prompt.includes('month') || prompt.includes('monthly')) hints.push('monthly_data');
    if (prompt.includes('quarter') || prompt.includes('quarterly')) hints.push('quarterly_data');
    if (prompt.includes('year') || prompt.includes('yearly')) hints.push('yearly_data');
    if (prompt.includes('week') || prompt.includes('weekly')) hints.push('weekly_data');
    
    // Metric hints
    if (prompt.includes('revenue') || prompt.includes('sales')) hints.push('revenue_metrics');
    if (prompt.includes('user') || prompt.includes('customer')) hints.push('user_metrics');
    if (prompt.includes('conversion') || prompt.includes('rate')) hints.push('conversion_metrics');
    
    return hints;
  }

  private createBaseChartFromAnalysis(analysis: any, request: AIChartRequest): ChartTemplate | null {
    const chartId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate sample data based on analysis
    const sampleData = this.generateSampleData(analysis);
    const config = this.generateChartConfig(analysis);

    return {
      id: chartId,
      name: this.generateChartName(request.prompt, analysis),
      description: this.generateChartDescription(request.prompt, analysis),
      category: analysis.category as any,
      type: analysis.type,
      tags: this.generateTags(request.prompt, analysis),
      author: 'AI Assistant',
      version: '1.0.0',
      rating: 0,
      downloads: 0,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'ai',
      thumbnail: this.generateThumbnailData(analysis.type),
      config,
      defaultOptions: config.options || {},
      dataRequirements: {
        required: this.getRequiredFields(analysis),
        optional: this.getOptionalFields(analysis),
        minDataPoints: 2,
        maxDataPoints: 1000,
        dataTypes: this.getDataTypes(analysis)
      },
      sampleData,
      dataMapping: {
        xAxis: sampleData.labels ? 'labels' : 'x',
        yAxis: 'value',
        series: 'dataset'
      },
      customization: {
        colors: {
          primary: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
          schemes: {
            default: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
            cool: ['#3b82f6', '#06b6d4', '#8b5cf6', '#6366f1', '#14b8a6'],
            warm: ['#ef4444', '#f59e0b', '#f97316', '#eab308', '#84cc16']
          }
        },
        themes: ['default', 'minimal', 'dark'],
        responsive: true,
        animations: true,
        interactive: true
      },
      useCases: [analysis.category + ' analysis', 'data visualization', 'reporting'],
      examples: [{
        title: 'Sample Usage',
        description: 'Example of how to use this chart with your data',
        data: sampleData
      }]
    };
  }

  private generateAlternativeCharts(analysis: any, request: AIChartRequest): ChartTemplate[] {
    const alternatives: ChartType[] = [];
    
    // Suggest alternative chart types based on primary type
    switch (analysis.type) {
      case 'bar':
        alternatives.push('line', 'area');
        break;
      case 'line':
        alternatives.push('bar', 'area');
        break;
      case 'pie':
        alternatives.push('doughnut', 'bar');
        break;
      case 'scatter':
        alternatives.push('line', 'bubble');
        break;
      default:
        alternatives.push('bar', 'line');
    }

    return alternatives.slice(0, 2).map(type => {
      const altAnalysis = { ...analysis, type };
      return this.createBaseChartFromAnalysis(altAnalysis, request);
    }).filter(Boolean) as ChartTemplate[];
  }

  // Helper methods for generating chart components
  private generateChartName(prompt: string, analysis: any): string {
    const words = prompt.split(' ').slice(0, 4).join(' ');
    return `${words.charAt(0).toUpperCase() + words.slice(1)} ${analysis.type.charAt(0).toUpperCase() + analysis.type.slice(1)} Chart`;
  }

  private generateChartDescription(prompt: string, analysis: any): string {
    return `AI-generated ${analysis.type} chart based on: "${prompt}". Confidence: ${Math.round(analysis.confidence * 100)}%`;
  }

  private generateTags(prompt: string, analysis: any): string[] {
    return ['ai-generated', analysis.category, analysis.type, ...analysis.keywords.slice(0, 3)];
  }

  private generateSampleData(analysis: any) {
    // Generate appropriate sample data based on chart type and category
    const labels = this.generateLabels(analysis);
    const datasets = this.generateDatasets(analysis, labels.length);
    
    return { labels, datasets };
  }

  private generateLabels(analysis: any): string[] {
    if (analysis.dataHints.includes('monthly_data')) {
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    }
    if (analysis.dataHints.includes('quarterly_data')) {
      return ['Q1', 'Q2', 'Q3', 'Q4'];
    }
    if (analysis.category === 'sales') {
      return ['Leads', 'Qualified', 'Proposals', 'Closed'];
    }
    if (analysis.category === 'marketing') {
      return ['Email', 'Social', 'PPC', 'Organic', 'Direct'];
    }
    
    return ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'];
  }

  private generateDatasets(analysis: any, labelCount: number) {
    const data = Array.from({ length: labelCount }, () => 
      Math.floor(Math.random() * 1000) + 100
    );

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    return [{
      label: analysis.category.charAt(0).toUpperCase() + analysis.category.slice(1),
      data,
      backgroundColor: analysis.type === 'pie' || analysis.type === 'doughnut' 
        ? colors.slice(0, labelCount)
        : colors[0],
      borderColor: colors[0],
      borderWidth: 1,
      fill: analysis.type === 'area'
    }];
  }

  private generateChartConfig(analysis: any) {
    return {
      type: analysis.type,
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `${analysis.category.charAt(0).toUpperCase() + analysis.category.slice(1)} ${analysis.type.charAt(0).toUpperCase() + analysis.type.slice(1)}`
          },
          legend: {
            position: 'top' as const
          }
        },
        scales: analysis.type === 'pie' || analysis.type === 'doughnut' ? undefined : {
          y: {
            beginAtZero: true
          }
        }
      }
    };
  }

  private generateThumbnailData(type: ChartType): string {
    // Return emoji representations for different chart types
    const thumbnails = {
      bar: '📊',
      line: '📈',
      pie: '🥧',
      doughnut: '🍩',
      scatter: '📍',
      radar: '🕸️',
      area: '📊',
      bubble: '🫧',
      polarArea: '🎯',
      funnel: '🛒'
    };
    
    return thumbnails[type] || '📊';
  }

  private getRequiredFields(analysis: any): string[] {
    if (analysis.type === 'scatter') return ['x', 'y'];
    return ['labels', 'values'];
  }

  private getOptionalFields(analysis: any): string[] {
    return ['category', 'timestamp', 'metadata'];
  }

  private getDataTypes(analysis: any): Record<string, 'string' | 'number' | 'date' | 'boolean'> {
    return {
      labels: 'string',
      values: 'number',
      timestamp: 'date',
      category: 'string'
    };
  }
}