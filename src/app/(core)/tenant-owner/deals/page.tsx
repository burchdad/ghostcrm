"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Search, Plus, Eye, Edit, Trash2, TrendingUp, DollarSign, Target, BarChart3, Bot } from "lucide-react";
import EmptyStateComponent from "@/components/feedback/EmptyStateComponent";
import { useI18n } from "@/components/utils/I18nProvider";
import { useToast } from "@/hooks/use-toast";
import "./page.css";

export default function TenantOwnerDealsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();

  // Role-based access control
  useEffect(() => {
    if (user && !['owner'].includes(user.role)) {
      console.log("🚨 [TENANT_OWNER_DEALS] Access denied - redirecting");
      router.push('/');
    }
  }, [user, router]);
  
  useRibbonPage({
    context: "leads",
    enable: ["bulkOps", "quickActions", "export", "share", "profile", "notifications"],
    disable: ["saveLayout", "aiTools", "developer", "billing"]
  });

  // State management
  const [deals, setDeals] = useState<any[]>([]);
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);

  // Check if user is owner
  if (user && !['owner'].includes(user.role)) {
    return null; // Will redirect via useEffect
  }

  // Fetch deals and AI suggestions
  useEffect(() => {
    async function fetchData() {
      try {
        console.log('🔄 Fetching deals and AI suggestions...');
        
        // Fetch deals
        const dealsResponse = await fetch('/api/deals');
        if (dealsResponse.ok) {
          const dealsData = await dealsResponse.json();
          console.log('✅ Deals fetched:', dealsData.records?.length || 0);
          setDeals(dealsData.records || []);
        } else {
          console.error('❌ Deals API error:', dealsResponse.status, dealsResponse.statusText);
          setDeals([]);
        }

        // Fetch AI suggestions (server-side processed)
        const aiResponse = await fetch('/api/deals/ai-suggestions');
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          console.log('🤖 AI suggestions fetched:', aiData.suggestions?.length || 0);
          setAiMatches(aiData.suggestions || []);
        } else {
          console.error('❌ AI suggestions API error:', aiResponse.status, aiResponse.statusText);
          // Don't fail completely if AI suggestions fail
          const errorData = await aiResponse.json().catch(() => ({}));
          console.log('AI error details:', errorData);
          setAiMatches([]);
        }

      } catch (error) {
        console.error('❌ Failed to fetch data:', error);
        toast({
          title: "Connection Issue",
          description: "Some data couldn't be loaded. Refresh the page to try again.",
          variant: "destructive",
        });
        setDeals([]);
        setAiMatches([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Filter deals based on search
  const filteredDeals = deals.filter(deal =>
    deal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.stage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate analytics with dynamic metrics
  const calculateAnalytics = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Current month deals
    const currentMonthDeals = deals.filter(deal => {
      const dealDate = deal.created_at ? new Date(deal.created_at) : new Date();
      return dealDate.getMonth() === currentMonth && dealDate.getFullYear() === currentYear;
    });
    
    // Previous month deals for comparison
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthDeals = deals.filter(deal => {
      const dealDate = deal.created_at ? new Date(deal.created_at) : new Date();
      return dealDate.getMonth() === prevMonth && dealDate.getFullYear() === prevYear;
    });
    
    // Calculate metrics
    const totalValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const currentMonthValue = currentMonthDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const prevMonthValue = prevMonthDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    
    const winRate = deals.length > 0 ? (deals.filter(d => d.stage === 'closed_won').length / deals.length) * 100 : 0;
    const avgDealSize = deals.length > 0 ? totalValue / deals.length : 0;
    const activeDealCount = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length;
    
    // Calculate month-over-month change
    const valueChange = prevMonthValue > 0 ? ((currentMonthValue - prevMonthValue) / prevMonthValue) * 100 : 0;
    
    // Determine performance status
    const getPerformanceStatus = (rate: number) => {
      if (rate >= 80) return "Excellent performance";
      if (rate >= 60) return "Good performance";
      if (rate >= 40) return "Average performance";
      if (rate >= 20) return "Below average";
      return "Needs improvement";
    };
    
    // Determine deal growth trend
    const getDealTrend = (change: number) => {
      if (change > 10) return "Strong growth";
      if (change > 0) return "Growing deals";
      if (change === 0) return "Steady pipeline";
      if (change > -10) return "Slight decline";
      return "Declining trend";
    };
    
    return {
      totalValue,
      winRate,
      avgDealSize,
      pipelineStage: activeDealCount,
      valueChange,
      performanceStatus: getPerformanceStatus(winRate),
      dealTrend: getDealTrend(valueChange),
      totalDeals: deals.length
    };
  };

  const analytics = calculateAnalytics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (loading) {
    return (
      <div className="tenant-owner-deals-container">
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-cards">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
          <div className="skeleton-table"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-owner-deals-container">
      <div className="page-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">
              {user?.tenantId} - Deal Management
            </h1>
            <p className="page-subtitle">Owner Access</p>
          </div>
        </div>

        {/* Analytics Cards in Header */}
        <div className="analytics-grid">
          <Card className="analytics-card revenue">
            <div className="card-content">
              <div className="metric-info">
                <h3>Total Pipeline Value</h3>
                <p className="metric-value">{formatCurrency(analytics.totalValue)}</p>
                <p className={`metric-change ${analytics.valueChange >= 0 ? 'positive' : 'negative'}`}>
                  {analytics.valueChange >= 0 ? '+' : ''}{analytics.valueChange.toFixed(1)}% this month
                </p>
              </div>
              <div className="metric-icon">
                <DollarSign />
              </div>
            </div>
          </Card>

          <Card className="analytics-card performance">
            <div className="card-content">
              <div className="metric-info">
                <h3>Win Rate</h3>
                <p className="metric-value">{analytics.winRate.toFixed(1)}%</p>
                <p className={`metric-change ${analytics.winRate >= 60 ? 'positive' : analytics.winRate >= 40 ? 'neutral' : 'negative'}`}>
                  {analytics.performanceStatus}
                </p>
              </div>
              <div className="metric-icon">
                <Target />
              </div>
            </div>
          </Card>

          <Card className="analytics-card deals">
            <div className="card-content">
              <div className="metric-info">
                <h3>Active Deals</h3>
                <p className="metric-value">{analytics.pipelineStage}</p>
                <p className="metric-change neutral">{analytics.totalDeals} total deals</p>
              </div>
              <div className="metric-icon">
                <BarChart3 />
              </div>
            </div>
          </Card>

          <Card className="analytics-card average">
            <div className="card-content">
              <div className="metric-info">
                <h3>Avg Deal Size</h3>
                <p className="metric-value">{formatCurrency(analytics.avgDealSize)}</p>
                <p className={`metric-change ${analytics.valueChange >= 0 ? 'positive' : analytics.valueChange === 0 ? 'neutral' : 'negative'}`}>
                  {analytics.dealTrend}
                </p>
              </div>
              <div className="metric-icon">
                <TrendingUp />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="deals-content">
        {/* Controls */}
        <div className="controls-section">
          <div className="search-container">
            <Search className="search-icon" />
            <Input
              placeholder="Search deals by name, company, or stage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="control-actions">
            <Button
              variant={bulkMode ? "default" : "outline"}
              onClick={() => setBulkMode(!bulkMode)}
              className="bulk-mode-btn"
            >
              Bulk Actions
            </Button>
            
            <Button 
              className="btn-primary"
              onClick={() => router.push('/tenant-owner/new-deal')}
            >
              <Plus className="icon" />
              New Deal
            </Button>
          </div>
        </div>

        {/* AI Insights Section */}
        {aiMatches.length > 0 && (
          <div className="ai-insights-section">
            <div className="ai-insights-header">
              <div className="ai-badge">
                <Bot className="ai-icon" />
                <span>AI Deal Intelligence</span>
              </div>
              <p className="ai-description">Smart matching between leads and inventory • {aiMatches.length} recommendation{aiMatches.length > 1 ? 's' : ''} found</p>
            </div>
            
            <div className="ai-suggestions-list">
              {aiMatches.map((match, index) => {
                const scoreClass = match.score >= 80 ? 'hot-match' : match.score >= 60 ? 'good-match' : 'potential-match';
                const primaryTag = match.score >= 80 ? 'Hot Match' : match.score >= 60 ? 'Good Match' : 'Potential';
                
                return (
                  <Card key={index} className={`ai-suggestion-card ${scoreClass}`}>
                    <div className="suggestion-content-row">
                      <div className="match-score">{match.score}%</div>
                      <div className="match-info">
                        <h4>{match.leadName} → {match.vehicleDesc}</h4>
                        <p>Budget: {match.leadBudget} | Vehicle Price: ${match.vehiclePrice?.toLocaleString()}</p>
                        <div className="match-tags">
                          <span className={`tag ${scoreClass.split('-')[0]}`}>{primaryTag}</span>
                          {match.matchTags?.includes('financing') && <span className="tag financing">Qualified</span>}
                          {match.matchTags?.includes('new') && <span className="tag new">New Vehicle</span>}
                          {match.matchTags?.includes('preference') && <span className="tag preference">Brand Match</span>}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="create-deal-btn"
                        onClick={() => {
                          toast({
                            title: "Creating Deal",
                            description: `Setting up deal for ${match.leadName} and ${match.vehicleDesc}`,
                          });
                        }}
                      >
                        Create Deal
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Deals Table */}
        <Card className="deals-table-card">
        {filteredDeals.length === 0 ? (
          <EmptyStateComponent
            type="deals"
            title="No deals found"
            description="Get started by adding your first deal or adjust your search filters."
            actionLabel="Add Deal"
            onAction={() => router.push('/file/new-deal')}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {bulkMode && <TableHead className="w-12">Select</TableHead>}
                <TableHead>Deal Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.map((deal, index) => (
                <TableRow key={deal.id || index} className="deal-row">
                  {bulkMode && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIdxs.includes(index)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIdxs([...selectedIdxs, index]);
                          } else {
                            setSelectedIdxs(selectedIdxs.filter(i => i !== index));
                          }
                        }}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{deal.name || `Deal #${index + 1}`}</TableCell>
                  <TableCell>{deal.company || 'Unknown Company'}</TableCell>
                  <TableCell>{formatCurrency(deal.amount || 0)}</TableCell>
                  <TableCell>
                    <span className={`stage-badge ${deal.stage}`}>
                      {deal.stage || 'new'}
                    </span>
                  </TableCell>
                  <TableCell>{deal.probability || '50'}%</TableCell>
                  <TableCell>{deal.owner || user?.email}</TableCell>
                  <TableCell>{deal.created_at ? new Date(deal.created_at).toLocaleDateString() : 'Today'}</TableCell>
                  <TableCell>
                    <div className="action-buttons">
                      <Button size="sm" variant="ghost">
                        <Eye className="icon-sm" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="icon-sm" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="icon-sm" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        </Card>
      </div>
    </div>
  );
}