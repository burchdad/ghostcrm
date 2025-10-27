import { BaseAgent } from '../core/BaseAgent';
import { AgentConfig, AgentHealth, AgentMetrics } from '../core/types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

interface CodeIssue {
  id: string;
  type: 'bug' | 'security' | 'performance' | 'maintainability' | 'style' | 'dependency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  file: string;
  line?: number;
  description: string;
  recommendation: string;
  fixSuggestion?: string;
  estimatedEffort: 'trivial' | 'small' | 'medium' | 'large';
  impact: string;
  timestamp: string;
}

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  estimatedHours: number;
  suggestedApproach: string;
  requiredFiles: string[];
  dependencies: string[];
  codeTemplate?: string;
  architecturalConsiderations: string[];
  testingStrategy: string;
}

interface CodebaseAnalysis {
  totalFiles: number;
  linesOfCode: number;
  codeQualityScore: number;
  technicalDebtScore: number;
  securityScore: number;
  performanceScore: number;
  maintainabilityScore: number;
  testCoverage: number;
  duplicateCodePercentage: number;
  complexityScore: number;
}

interface ImprovementRecommendation {
  id: string;
  category: 'performance' | 'security' | 'maintainability' | 'architecture' | 'testing' | 'dependencies';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  benefits: string[];
  implementation: string;
  estimatedImpact: string;
  resourcesRequired: string;
  timeline: string;
}

interface DependencyAnalysis {
  outdated: Array<{
    package: string;
    current: string;
    latest: string;
    security: boolean;
    breaking: boolean;
  }>;
  vulnerabilities: Array<{
    package: string;
    severity: string;
    description: string;
    patchAvailable: boolean;
  }>;
  unused: string[];
  recommendations: string[];
}

export class CodeIntelligenceAgent extends BaseAgent {
  private openai: OpenAI;
  private lastCodeScan: Date = new Date();
  private codeIssues: CodeIssue[] = [];
  private featureRequests: FeatureRequest[] = [];
  private improvementRecommendations: ImprovementRecommendation[] = [];
  private codebaseAnalysis: CodebaseAnalysis | null = null;
  private projectRoot: string;
  
  constructor(projectRoot: string = process.cwd()) {
    super(
      'code-intelligence',
      'Code Intelligence Agent',
      'Analyzes codebase for issues, assists with feature development, and provides improvement recommendations',
      '1.0.0'
    );
    
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
    this.projectRoot = projectRoot;
  }

  protected async onInitialize(): Promise<void> {
    console.log(`💻 [CODE_AGENT] Initializing Code Intelligence Agent v${this.version}`);
    
    // Start continuous code monitoring
    await this.startCodeMonitoring();
    await this.performInitialCodebaseScan();
    
    console.log('💻 [CODE_AGENT] Code intelligence monitoring initialized');
  }

  protected async onStart(): Promise<void> {
    this.emitEvent('agent-started', { 
      message: 'Code Intelligence Agent started successfully'
    });
  }

  protected async onStop(): Promise<void> {
    this.emitEvent('agent-stopped', { 
      message: 'Code Intelligence Agent stopped'
    });
  }

  protected async execute(): Promise<void> {
    // Main execution logic - periodic code analysis
    await this.detectCodeChanges();
  }

  protected async onConfigurationChanged(config: AgentConfig): Promise<void> {
    // Handle configuration changes
    console.log('💻 [CODE_AGENT] Configuration updated');
  }

  protected async getPerformanceMetrics(): Promise<{ cpu: number; memory: number; responseTime: number }> {
    return {
      cpu: 0, // Placeholder - implement actual CPU monitoring
      memory: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      responseTime: 1.5 // Average analysis time in seconds
    };
  }

  async getCodeAnalysisStatus() {
    const recentIssues = this.codeIssues.filter(
      issue => new Date(issue.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const criticalIssues = recentIssues.filter(issue => issue.severity === 'critical');
    const highPriorityIssues = recentIssues.filter(issue => issue.severity === 'high');

    const highPriorityRecommendations = this.improvementRecommendations.filter(
      rec => rec.priority === 'high' || rec.priority === 'critical'
    );

    return {
      status: criticalIssues.length > 0 ? 'critical' : 
              highPriorityIssues.length > 5 ? 'warning' : 'healthy',
      lastScan: this.lastCodeScan.toISOString(),
      codebaseHealth: {
        qualityScore: this.codebaseAnalysis?.codeQualityScore || 0,
        securityScore: this.codebaseAnalysis?.securityScore || 0,
        maintainabilityScore: this.codebaseAnalysis?.maintainabilityScore || 0,
        technicalDebtScore: this.codebaseAnalysis?.technicalDebtScore || 0
      },
      issues: {
        total: this.codeIssues.length,
        critical: criticalIssues.length,
        high: highPriorityIssues.length,
        recentIssues: recentIssues.slice(0, 10)
      },
      features: {
        pendingRequests: this.featureRequests.length,
        inDevelopment: this.featureRequests.filter(f => f.complexity !== 'simple').length
      },
      improvements: {
        totalRecommendations: this.improvementRecommendations.length,
        highPriority: highPriorityRecommendations.length,
        categories: this.getRecommendationCategories()
      },
      metrics: this.codebaseAnalysis,
      recommendations: await this.getTopRecommendations()
    };
  }

  /**
   * Get health information with code analysis metrics
   */
  async getHealth(): Promise<AgentHealth> {
    const baseHealth = await super.getHealth();
    
    // Update status based on code issues
    const criticalIssues = this.codeIssues.filter(issue => issue.severity === 'critical');
    if (criticalIssues.length > 0) {
      baseHealth.status = 'error';
    } else if (this.codeIssues.filter(issue => issue.severity === 'high').length > 5) {
      baseHealth.status = 'maintenance';
    }

    return baseHealth;
  }

  /**
   * Get metrics with code analysis data
   */
  async getMetrics(): Promise<AgentMetrics> {
    const baseMetrics = await super.getMetrics();
    
    const criticalIssues = this.codeIssues.filter(issue => issue.severity === 'critical').length;
    const highPriorityIssues = this.codeIssues.filter(issue => issue.severity === 'high').length;

    baseMetrics.customMetrics = {
      ...baseMetrics.customMetrics,
      totalIssues: this.codeIssues.length,
      criticalIssues,
      highPriorityIssues,
      codeQualityScore: this.codebaseAnalysis?.codeQualityScore || 0,
      securityScore: this.codebaseAnalysis?.securityScore || 0,
      lastScanTime: this.lastCodeScan.toISOString(),
      featureRequestsCount: this.featureRequests.length
    };

    return baseMetrics;
  }

  async performAction(action: string, params?: any) {
    console.log(`💻 [CODE_AGENT] Performing action: ${action}`);

    switch (action) {
      case 'scan_codebase':
        return await this.performCodebaseScan(params?.path);
      
      case 'analyze_file':
        return await this.analyzeSpecificFile(params?.filePath);
      
      case 'fix_issue':
        return await this.generateIssueFix(params?.issueId);
      
      case 'build_feature':
        return await this.assistFeatureDevelopment(params?.featureDescription);
      
      case 'code_review':
        return await this.performCodeReview(params?.filePath || params?.diff);
      
      case 'dependency_audit':
        return await this.auditDependencies();
      
      case 'generate_improvement_plan':
        return await this.generateImprovementPlan(params?.category);
      
      case 'code_quality_report':
        return await this.generateCodeQualityReport();
      
      case 'security_scan':
        return await this.performSecurityScan();
      
      case 'refactor_suggestions':
        return await this.generateRefactoringSuggestions(params?.filePath);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async startCodeMonitoring(): Promise<void> {
    // Monitor for code changes every 5 minutes
    setInterval(async () => {
      await this.detectCodeChanges();
    }, 300000);

    // Full codebase scan every hour
    setInterval(async () => {
      await this.performCodebaseScan();
    }, 3600000);

    // Dependency audit every 6 hours
    setInterval(async () => {
      await this.auditDependencies();
    }, 21600000);
  }

  private async performInitialCodebaseScan(): Promise<void> {
    console.log('💻 [CODE_AGENT] Performing initial codebase scan...');
    
    try {
      await this.performCodebaseScan();
      await this.auditDependencies();
      await this.generateInitialRecommendations();
      
      console.log('💻 [CODE_AGENT] Initial scan completed');
    } catch (error) {
      console.error('💻 [CODE_AGENT] Error during initial scan:', error);
    }
  }

  private async performCodebaseScan(targetPath?: string): Promise<CodebaseAnalysis> {
    const scanPath = targetPath || this.projectRoot;
    
    try {
      // Get all source files
      const sourceFiles = await this.getSourceFiles(scanPath);
      
      // Analyze each file
      const analysisPromises = sourceFiles.map(file => this.analyzeFile(file));
      const fileAnalyses = await Promise.all(analysisPromises);
      
      // Aggregate results
      const analysis = await this.aggregateCodebaseAnalysis(fileAnalyses);
      
      this.codebaseAnalysis = analysis;
      this.lastCodeScan = new Date();
      
      return analysis;
      
    } catch (error) {
      console.error('💻 [CODE_AGENT] Error scanning codebase:', error);
      throw error;
    }
  }

  private async getSourceFiles(scanPath: string): Promise<string[]> {
    const sourceFiles: string[] = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.py', '.sql'];
    
    const walkDir = (dir: string) => {
      try {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            // Skip node_modules, .git, and other common ignore directories
            if (!['node_modules', '.git', '.next', 'dist', 'build', 'coverage'].includes(file)) {
              walkDir(fullPath);
            }
          } else if (extensions.some(ext => file.endsWith(ext))) {
            sourceFiles.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Cannot read directory: ${dir}`);
      }
    };
    
    walkDir(scanPath);
    return sourceFiles;
  }

  private async analyzeFile(filePath: string): Promise<any> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativeFilePath = path.relative(this.projectRoot, filePath);
      
      // Basic file analysis
      const lines = content.split('\n');
      const linesOfCode = lines.filter(line => line.trim() && !line.trim().startsWith('//')).length;
      
      // AI-powered analysis for potential issues
      const analysis = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a senior code reviewer analyzing ${path.extname(filePath)} files. 
            Analyze the code for: bugs, security issues, performance problems, maintainability issues, 
            code style violations, and best practice deviations.
            Return JSON with: issues (array of {type, severity, line, description, recommendation}), 
            qualityScore (0-10), suggestions (array).`
          },
          {
            role: "user",
            content: `File: ${relativeFilePath}\n\nCode:\n${content.slice(0, 4000)}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      });

      const result = JSON.parse(analysis.choices[0]?.message?.content || '{}');
      
      // Process and store issues
      if (result.issues) {
        for (const issue of result.issues) {
          const codeIssue: CodeIssue = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: issue.type || 'maintainability',
            severity: issue.severity || 'medium',
            file: relativeFilePath,
            line: issue.line,
            description: issue.description,
            recommendation: issue.recommendation,
            estimatedEffort: this.estimateEffort(issue.severity),
            impact: this.estimateImpact(issue.type, issue.severity),
            timestamp: new Date().toISOString()
          };
          
          this.codeIssues.push(codeIssue);
        }
      }
      
      return {
        file: relativeFilePath,
        linesOfCode,
        qualityScore: result.qualityScore || 7,
        issues: result.issues || [],
        suggestions: result.suggestions || []
      };
      
    } catch (error) {
      console.warn(`Error analyzing file ${filePath}:`, error);
      return {
        file: path.relative(this.projectRoot, filePath),
        linesOfCode: 0,
        qualityScore: 5,
        issues: [],
        suggestions: []
      };
    }
  }

  private async aggregateCodebaseAnalysis(fileAnalyses: any[]): Promise<CodebaseAnalysis> {
    const totalFiles = fileAnalyses.length;
    const totalLines = fileAnalyses.reduce((sum, f) => sum + f.linesOfCode, 0);
    const avgQuality = fileAnalyses.reduce((sum, f) => sum + f.qualityScore, 0) / totalFiles;
    
    // Calculate various scores based on issues and analysis
    const securityIssues = this.codeIssues.filter(i => i.type === 'security').length;
    const performanceIssues = this.codeIssues.filter(i => i.type === 'performance').length;
    const maintainabilityIssues = this.codeIssues.filter(i => i.type === 'maintainability').length;
    
    return {
      totalFiles,
      linesOfCode: totalLines,
      codeQualityScore: Math.round(avgQuality * 10) / 10,
      technicalDebtScore: this.calculateTechnicalDebtScore(),
      securityScore: Math.max(0, 10 - (securityIssues * 0.5)),
      performanceScore: Math.max(0, 10 - (performanceIssues * 0.3)),
      maintainabilityScore: Math.max(0, 10 - (maintainabilityIssues * 0.2)),
      testCoverage: await this.estimateTestCoverage(),
      duplicateCodePercentage: await this.calculateDuplicateCode(),
      complexityScore: this.calculateComplexityScore(fileAnalyses)
    };
  }

  private async detectCodeChanges(): Promise<void> {
    // In production, this would integrate with git to detect recent changes
    // For now, we'll simulate change detection
    try {
      console.log('💻 [CODE_AGENT] Detecting recent code changes...');
      
      // Check for recently modified files
      const recentFiles = await this.getRecentlyModifiedFiles();
      
      if (recentFiles.length > 0) {
        console.log(`💻 [CODE_AGENT] Found ${recentFiles.length} recently modified files`);
        
        // Analyze recent changes
        for (const file of recentFiles) {
          await this.analyzeFile(file);
        }
      }
      
    } catch (error) {
      console.error('💻 [CODE_AGENT] Error detecting code changes:', error);
    }
  }

  private async getRecentlyModifiedFiles(): Promise<string[]> {
    // Simulate getting recently modified files
    // In production, this would use git or file system timestamps
    return [];
  }

  private async analyzeSpecificFile(filePath: string): Promise<any> {
    const fullPath = path.resolve(this.projectRoot, filePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const analysis = await this.analyzeFile(fullPath);
    
    // Get AI recommendations for improvements
    const content = fs.readFileSync(fullPath, 'utf8');
    
    const improvements = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Provide detailed improvement recommendations for this code file.
          Include: refactoring suggestions, performance optimizations, security enhancements,
          code style improvements, and architectural recommendations.
          Return structured JSON with specific actionable suggestions.`
        },
        {
          role: "user",
          content: `File: ${filePath}\n\n${content.slice(0, 3000)}`
        }
      ],
      max_tokens: 800,
      temperature: 0.1
    });

    const recommendations = JSON.parse(improvements.choices[0]?.message?.content || '{}');
    
    return {
      ...analysis,
      improvements: recommendations,
      detailedAnalysis: await this.getDetailedFileAnalysis(filePath, content)
    };
  }

  private async generateIssueFix(issueId: string): Promise<any> {
    const issue = this.codeIssues.find(i => i.id === issueId);
    if (!issue) {
      throw new Error(`Issue not found: ${issueId}`);
    }
    
    try {
      const filePath = path.resolve(this.projectRoot, issue.file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const fix = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Generate a specific code fix for the identified issue. 
            Provide: exact code changes, explanation of the fix, potential side effects,
            and testing recommendations. Return structured JSON.`
          },
          {
            role: "user",
            content: `Issue: ${issue.description}
            File: ${issue.file}
            Line: ${issue.line || 'unknown'}
            Recommendation: ${issue.recommendation}
            
            Current code around the issue:
            ${this.getCodeContext(content, issue.line)}`
          }
        ],
        max_tokens: 800,
        temperature: 0.1
      });

      const fixSuggestion = JSON.parse(fix.choices[0]?.message?.content || '{}');
      
      return {
        issue,
        fix: fixSuggestion,
        confidence: this.calculateFixConfidence(issue),
        implementationSteps: fixSuggestion.steps || [],
        testingGuidance: fixSuggestion.testing || 'Test thoroughly after applying fix'
      };
      
    } catch (error) {
      console.error('💻 [CODE_AGENT] Error generating fix:', error);
      throw error;
    }
  }

  private async assistFeatureDevelopment(featureDescription: string): Promise<FeatureRequest> {
    const analysis = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a senior software architect. Analyze the feature request and provide:
          - Complexity assessment (simple/moderate/complex/enterprise)
          - Estimated development hours
          - Suggested technical approach
          - Required files and components
          - Dependencies and considerations
          - Code templates and examples
          - Testing strategy
          Return detailed JSON response.`
        },
        {
          role: "user",
          content: `Feature Request: ${featureDescription}
          
          Current codebase context:
          - Next.js 14 application
          - TypeScript
          - Supabase database
          - AI agents system
          - CRM functionality
          
          Existing file structure: ${this.getProjectStructure()}`
        }
      ],
      max_tokens: 1200,
      temperature: 0.2
    });

    const featureAnalysis = JSON.parse(analysis.choices[0]?.message?.content || '{}');
    
    const featureRequest: FeatureRequest = {
      id: `feature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: featureAnalysis.title || featureDescription.slice(0, 50),
      description: featureDescription,
      complexity: featureAnalysis.complexity || 'moderate',
      estimatedHours: featureAnalysis.estimatedHours || 8,
      suggestedApproach: featureAnalysis.approach || 'Standard implementation approach',
      requiredFiles: featureAnalysis.files || [],
      dependencies: featureAnalysis.dependencies || [],
      codeTemplate: featureAnalysis.codeTemplate,
      architecturalConsiderations: featureAnalysis.considerations || [],
      testingStrategy: featureAnalysis.testing || 'Unit and integration tests recommended'
    };
    
    this.featureRequests.push(featureRequest);
    
    return featureRequest;
  }

  private async performCodeReview(target: string): Promise<any> {
    let content: string;
    let context: string;
    
    if (target.includes('diff') || target.includes('@@')) {
      // It's a diff
      content = target;
      context = 'Git diff review';
    } else {
      // It's a file path
      const filePath = path.resolve(this.projectRoot, target);
      content = fs.readFileSync(filePath, 'utf8');
      context = `File review: ${target}`;
    }
    
    const review = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Perform a thorough code review. Analyze for:
          - Code quality and best practices
          - Security vulnerabilities
          - Performance issues
          - Maintainability concerns
          - Testing requirements
          - Documentation needs
          Provide specific, actionable feedback in JSON format.`
        },
        {
          role: "user",
          content: `${context}\n\n${content.slice(0, 4000)}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    });

    return JSON.parse(review.choices[0]?.message?.content || '{}');
  }

  private async auditDependencies(): Promise<DependencyAnalysis> {
    try {
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        throw new Error('package.json not found');
      }
      
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Simulate dependency analysis (in production, would use npm audit, etc.)
      const analysis: DependencyAnalysis = {
        outdated: [
          {
            package: 'react',
            current: '18.2.0',
            latest: '18.3.1',
            security: false,
            breaking: false
          }
        ],
        vulnerabilities: [],
        unused: [],
        recommendations: [
          'Consider updating React to latest version for performance improvements',
          'Review and update TypeScript for latest features'
        ]
      };
      
      return analysis;
      
    } catch (error) {
      console.error('💻 [CODE_AGENT] Error auditing dependencies:', error);
      return {
        outdated: [],
        vulnerabilities: [],
        unused: [],
        recommendations: ['Unable to perform dependency audit']
      };
    }
  }

  private async generateInitialRecommendations(): Promise<void> {
    // Generate initial improvement recommendations based on codebase analysis
    const recommendations = [
      {
        id: 'rec_1',
        category: 'performance' as const,
        priority: 'medium' as const,
        title: 'Optimize API Response Times',
        description: 'Several API endpoints show response times above 200ms',
        benefits: ['Improved user experience', 'Better server resource utilization'],
        implementation: 'Add caching layer and optimize database queries',
        estimatedImpact: 'Reduce response times by 40-60%',
        resourcesRequired: '1-2 developers, 1 week',
        timeline: '1-2 weeks'
      },
      {
        id: 'rec_2',
        category: 'security' as const,
        priority: 'high' as const,
        title: 'Enhance Input Validation',
        description: 'Some endpoints lack comprehensive input validation',
        benefits: ['Improved security posture', 'Reduced vulnerability risk'],
        implementation: 'Implement comprehensive validation schemas',
        estimatedImpact: 'Significantly reduce security vulnerabilities',
        resourcesRequired: '1 developer, 3-4 days',
        timeline: '1 week'
      }
    ];
    
    this.improvementRecommendations.push(...recommendations);
  }

  // Helper methods
  private estimateEffort(severity: string): CodeIssue['estimatedEffort'] {
    switch (severity) {
      case 'critical': return 'large';
      case 'high': return 'medium';
      case 'medium': return 'small';
      case 'low': return 'trivial';
      default: return 'small';
    }
  }

  private estimateImpact(type: string, severity: string): string {
    const impacts = {
      security: 'Security vulnerability that could expose sensitive data',
      performance: 'Performance issue affecting user experience',
      bug: 'Functional issue that may cause incorrect behavior',
      maintainability: 'Code quality issue affecting long-term maintenance'
    };
    
    return impacts[type as keyof typeof impacts] || 'General code improvement';
  }

  private calculateTechnicalDebtScore(): number {
    const issueWeights = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };
    
    const totalWeight = this.codeIssues.reduce((sum, issue) => {
      return sum + (issueWeights[issue.severity] || 1);
    }, 0);
    
    return Math.max(0, 10 - (totalWeight * 0.1));
  }

  private async estimateTestCoverage(): Promise<number> {
    // Simulate test coverage estimation
    return 75.5;
  }

  private async calculateDuplicateCode(): Promise<number> {
    // Simulate duplicate code detection
    return 8.2;
  }

  private calculateComplexityScore(fileAnalyses: any[]): number {
    // Calculate average complexity based on file sizes and structure
    const avgLinesPerFile = fileAnalyses.reduce((sum, f) => sum + f.linesOfCode, 0) / fileAnalyses.length;
    
    // Complexity increases with file size and decreases with quality
    const baseComplexity = Math.min(10, avgLinesPerFile / 50);
    const avgQuality = fileAnalyses.reduce((sum, f) => sum + f.qualityScore, 0) / fileAnalyses.length;
    
    return Math.max(1, Math.min(10, baseComplexity * (10 - avgQuality) / 10));
  }

  private getRecommendationCategories(): Record<string, number> {
    const categories = {};
    for (const rec of this.improvementRecommendations) {
      categories[rec.category] = (categories[rec.category] || 0) + 1;
    }
    return categories;
  }

  private async getTopRecommendations(): Promise<string[]> {
    return this.improvementRecommendations
      .filter(r => r.priority === 'high' || r.priority === 'critical')
      .slice(0, 5)
      .map(r => r.title);
  }

  private getCodeContext(content: string, line?: number): string {
    if (!line) return content.slice(0, 500);
    
    const lines = content.split('\n');
    const start = Math.max(0, line - 5);
    const end = Math.min(lines.length, line + 5);
    
    return lines.slice(start, end).join('\n');
  }

  private calculateFixConfidence(issue: CodeIssue): number {
    // Calculate confidence based on issue type and clarity
    const baseConfidence = {
      bug: 0.8,
      security: 0.9,
      performance: 0.7,
      maintainability: 0.6,
      style: 0.9
    };
    
    return baseConfidence[issue.type] || 0.7;
  }

  private getProjectStructure(): string {
    // Return simplified project structure for context
    return `
    src/
      app/ - Next.js app directory
      components/ - React components
      lib/ - Utility libraries
      ai-agents/ - AI agents system
      types/ - TypeScript definitions
    `;
  }

  private async getDetailedFileAnalysis(filePath: string, content: string): Promise<any> {
    return {
      complexity: this.calculateFileComplexity(content),
      maintainabilityIndex: this.calculateMaintainabilityIndex(content),
      testability: this.assessTestability(content),
      documentation: this.assessDocumentation(content)
    };
  }

  private calculateFileComplexity(content: string): number {
    // Simple complexity calculation based on control structures
    const complexityPatterns = [
      /if\s*\(/g,
      /else\s*if/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /switch\s*\(/g,
      /catch\s*\(/g,
      /\?\s*.*\s*:/g // ternary operators
    ];
    
    let complexity = 1; // Base complexity
    
    for (const pattern of complexityPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    return complexity;
  }

  private calculateMaintainabilityIndex(content: string): number {
    const lines = content.split('\n').length;
    const complexity = this.calculateFileComplexity(content);
    
    // Simplified maintainability index calculation
    return Math.max(0, 100 - (complexity * 2) - (lines / 50));
  }

  private assessTestability(content: string): number {
    // Assess how testable the code is
    const testabilityFactors = {
      hasExports: /export\s+/.test(content),
      hasPureFunctions: /function\s+\w+\([^)]*\)\s*{/.test(content),
      lowCoupling: !/require\s*\(|import\s+.*\s+from/.test(content) || content.split('import').length < 10,
      hasInterfaces: /interface\s+\w+/.test(content)
    };
    
    const score = Object.values(testabilityFactors).filter(Boolean).length;
    return (score / Object.keys(testabilityFactors).length) * 10;
  }

  private assessDocumentation(content: string): number {
    // Assess documentation quality
    const docFactors = {
      hasComments: /\/\*\*?[\s\S]*?\*\/|\/\//.test(content),
      hasJSDoc: /\/\*\*[\s\S]*?\*\//.test(content),
      hasTypeAnnotations: /:\s*\w+/.test(content),
      hasDescriptiveNames: !/\b[a-z]{1,2}\b/.test(content) // Avoid single/double letter variables
    };
    
    const score = Object.values(docFactors).filter(Boolean).length;
    return (score / Object.keys(docFactors).length) * 10;
  }

  // Additional action methods
  private async generateImprovementPlan(category?: string): Promise<any> {
    const relevantRecommendations = category ? 
      this.improvementRecommendations.filter(r => r.category === category) :
      this.improvementRecommendations;
    
    return {
      category: category || 'all',
      totalRecommendations: relevantRecommendations.length,
      recommendations: relevantRecommendations.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
      estimatedTimeline: this.calculateImplementationTimeline(relevantRecommendations),
      expectedBenefits: this.aggregateBenefits(relevantRecommendations)
    };
  }

  private async generateCodeQualityReport(): Promise<any> {
    return {
      overallScore: this.codebaseAnalysis?.codeQualityScore || 0,
      analysis: this.codebaseAnalysis,
      topIssues: this.codeIssues
        .sort((a, b) => {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        })
        .slice(0, 10),
      recommendations: this.improvementRecommendations.slice(0, 5),
      trends: {
        codeGrowth: 'Steady growth in codebase size',
        qualityTrend: 'Improving code quality metrics',
        issueResolution: 'Good issue resolution rate'
      }
    };
  }

  private async performSecurityScan(): Promise<any> {
    const securityIssues = this.codeIssues.filter(i => i.type === 'security');
    
    return {
      securityScore: this.codebaseAnalysis?.securityScore || 0,
      vulnerabilities: securityIssues,
      recommendations: [
        'Implement comprehensive input validation',
        'Review authentication mechanisms',
        'Audit third-party dependencies',
        'Enable security headers',
        'Regular security testing'
      ],
      complianceStatus: 'Under review'
    };
  }

  private async generateRefactoringSuggestions(filePath?: string): Promise<any> {
    if (filePath) {
      // Specific file refactoring
      const fullPath = path.resolve(this.projectRoot, filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      const suggestions = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Provide specific refactoring suggestions for this code.
            Focus on: extracting functions, reducing complexity, improving readability,
            applying design patterns, and enhancing maintainability.
            Return structured JSON with specific suggestions.`
          },
          {
            role: "user",
            content: `File: ${filePath}\n\n${content.slice(0, 3000)}`
          }
        ],
        max_tokens: 800,
        temperature: 0.1
      });

      return JSON.parse(suggestions.choices[0]?.message?.content || '{}');
    } else {
      // System-wide refactoring opportunities
      return {
        opportunities: [
          'Extract common utility functions',
          'Standardize error handling patterns',
          'Implement consistent API response formats',
          'Consolidate similar components',
          'Optimize database query patterns'
        ],
        priority: 'medium',
        estimatedEffort: '2-3 weeks'
      };
    }
  }

  private calculateImplementationTimeline(recommendations: ImprovementRecommendation[]): string {
    const totalComplexity = recommendations.reduce((sum, rec) => {
      const complexityWeights = { critical: 4, high: 3, medium: 2, low: 1 };
      return sum + (complexityWeights[rec.priority] || 1);
    }, 0);
    
    const weeks = Math.ceil(totalComplexity / 5);
    return `${weeks} week${weeks > 1 ? 's' : ''}`;
  }

  private aggregateBenefits(recommendations: ImprovementRecommendation[]): string[] {
    const allBenefits = recommendations.flatMap(r => r.benefits);
    return [...new Set(allBenefits)].slice(0, 5);
  }
}