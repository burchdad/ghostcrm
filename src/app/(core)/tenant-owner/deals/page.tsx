"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/SupabaseAuthContext";
import { authenticatedFetch } from '@/lib/auth/client';
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
import PageAIAssistant from "@/components/ai/PageAIAssistant";
import "./page.css";

export default function TenantOwnerDealsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();

  // Role-based access control
  useEffect(() => {
    if (user && !['owner'].includes(user.role)) {
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
        // Fetch deals
        const dealsResponse = await authenticatedFetch('/api/deals');
        if (dealsResponse.ok) {
          const dealsData = await dealsResponse.json();
          setDeals(dealsData.records || []);
        } else {
          setDeals([]);
        }

        // Fetch AI suggestions (server-side processed)
        const aiResponse = await authenticatedFetch('/api/deals/ai-suggestions');
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          setAiMatches(aiData.suggestions || []);
        } else {
          // Don't fail completely if AI suggestions fail
          const errorData = await aiResponse.json().catch(() => ({}));
          setAiMatches([]);
        }

      } catch (error) {
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
      <div className="tenant-owner-deals-page">
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
    <div className="tenant-owner-deals-page">
      {/* Analytics Cards Grid with AI Assistant */}
      <div className="tenant-owner-deals-header">
        <div className="tenant-owner-deals-header-content">
          {/* Metrics in 4-Column Header Layout */}
          <div className="tenant-owner-deals-analytics-grid-header">
            <div className="tenant-owner-deals-analytics-card revenue">
              <div className="tenant-owner-deals-card-header">
                <div className="tenant-owner-deals-card-title-row">
                  <span className="tenant-owner-deals-card-label">PIPELINE VALUE</span>
                  <span className="tenant-owner-deals-card-value">{formatCurrency(analytics.totalValue)}</span>
                </div>
                <div className="tenant-owner-deals-card-icon revenue">
                  <DollarSign />
                </div>
              </div>
              <div className="tenant-owner-deals-card-trend">
                <TrendingUp />
                {analytics.valueChange >= 0 ? '+' : ''}{analytics.valueChange.toFixed(1)}% this month
              </div>
            </div>

            <div className="tenant-owner-deals-analytics-card performance">
              <div className="tenant-owner-deals-card-header">
                <div className="tenant-owner-deals-card-title-row">
                  <span className="tenant-owner-deals-card-label">WIN RATE</span>
                  <span className="tenant-owner-deals-card-value">{analytics.winRate.toFixed(1)}%</span>
                </div>
                <div className="tenant-owner-deals-card-icon performance">
                  <Target />
                </div>
              </div>
              <div className="tenant-owner-deals-card-trend">
                <TrendingUp />
                {analytics.performanceStatus}
              </div>
            </div>

            <div className="tenant-owner-deals-analytics-card deals">
              <div className="tenant-owner-deals-card-header">
                <div className="tenant-owner-deals-card-title-row">
                  <span className="tenant-owner-deals-card-label">ACTIVE DEALS</span>
                  <span className="tenant-owner-deals-card-value">{analytics.pipelineStage}</span>
                </div>
                <div className="tenant-owner-deals-card-icon deals">
                  <BarChart3 />
                </div>
              </div>
              <div className="tenant-owner-deals-card-trend">
                <TrendingUp />
                {analytics.totalDeals} total deals
              </div>
            </div>

            <div className="tenant-owner-deals-analytics-card average">
              <div className="tenant-owner-deals-card-header">
                <div className="tenant-owner-deals-card-title-row">
                  <span className="tenant-owner-deals-card-label">AVG DEAL SIZE</span>
                  <span className="tenant-owner-deals-card-value">{formatCurrency(analytics.avgDealSize)}</span>
                </div>
                <div className="tenant-owner-deals-card-icon average">
                  <TrendingUp />
                </div>
              </div>
              <div className="tenant-owner-deals-card-trend">
                <TrendingUp />
                {analytics.dealTrend}
              </div>
            </div>
          </div>

          {/* AI Assistant Insights Section */}
          <div className="tenant-owner-deals-ai-insights-section">
            <PageAIAssistant 
              agentId="deals" 
              pageTitle="Deal Management"
              className="tenant-owner-deals-ai-assistant"
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="tenant-owner-deals-content-wrapper">
        <div className="tenant-owner-deals-content">

        {/* Enhanced Search and Controls */}
        <div className="tenant-owner-deals-controls">
          <div className="tenant-owner-deals-search-row">
            <div className="tenant-owner-deals-search-container">
              <Search className="tenant-owner-deals-search-icon" />
              <Input
                placeholder="Search deals by name, company, or stage..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="tenant-owner-deals-search-input"
              />
            </div>
            
            <div className="tenant-owner-deals-filters">
              <Button
                onClick={() => setBulkMode(!bulkMode)}
                variant={bulkMode ? "default" : "outline"}
                className="tenant-owner-deals-filter-select"
              >
                {bulkMode ? "Exit Bulk Mode" : "Bulk Actions"}
              </Button>
              
              <Button 
                className="tenant-owner-deals-add-btn"
                onClick={() => router.push('/tenant-owner/new-deal')}
              >
                <Plus />
                New Deal
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Deals Table */}
        <div className="tenant-owner-deals-table-container">
          {deals.length === 0 ? (
            <div className="tenant-owner-deals-empty-state">
              <div className="tenant-owner-deals-empty-icon">
                <BarChart3 />
              </div>
              <h3 className="tenant-owner-deals-empty-title">No deals found</h3>
              <p className="tenant-owner-deals-empty-description">
                Start building your sales pipeline by creating your first deal.
              </p>
              
              {/* AI Assistant Badge */}
              <div className="tenant-owner-deals-empty-ai-badge">
                <Bot className="w-4 h-4" />
                <span>AI-powered deal tracking available</span>
              </div>
            </div>
          ) : (
            <Table className="tenant-owner-deals-table">
              <TableHeader className="tenant-owner-deals-table-header">
                <TableRow>
                  {bulkMode && <TableHead>Select</TableHead>}
                  <TableHead>Deal Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Close Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="tenant-owner-deals-table-body">
                {deals.map((deal, idx) => (
                  <TableRow 
                    key={deal.id || idx}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    {bulkMode && (
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIdxs.includes(idx)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIdxs([...selectedIdxs, idx]);
                            } else {
                              setSelectedIdxs(selectedIdxs.filter(i => i !== idx));
                            }
                          }}
                        />
                      </TableCell>
                    )}
                    <TableCell style={{ fontWeight: '500' }}>{deal.name}</TableCell>
                    <TableCell>{deal.company}</TableCell>
                    <TableCell>{formatCurrency(deal.value)}</TableCell>
                    <TableCell>
                      <span className="tenant-owner-deals-status-badge">
                        {deal.stage}
                      </span>
                    </TableCell>
                    <TableCell>{deal.close_date ? new Date(deal.close_date).toLocaleDateString() : 'Not set'}</TableCell>
                    <TableCell>
                      <div className="tenant-owner-deals-action-buttons">
                        <Button
                          size="sm"
                          variant="outline"
                          className="tenant-owner-deals-action-btn view"
                        >
                          <Eye />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="tenant-owner-deals-action-btn edit"
                        >
                          <Edit />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        </div> {/* Close tenant-owner-deals-content */}
      </div> {/* Close tenant-owner-deals-content-wrapper */}
    </div>
  );
}