import React, { useEffect, useRef, useState } from 'react'
import {
  Chart,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'
import {
  ChartBarIcon,
  PlusIcon,
  SparklesIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline'
import DashboardChartGrid from './DashboardChartGrid'
import CustomChartsManager, { CustomChart } from './CustomChartsManager'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

// -------------------- Chart.js registration --------------------
Chart.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
)

// -------------------- Types --------------------
export interface ChartSuggestion {
  title: string
  chartType: 'bar' | 'line' | 'pie'
  config: any
  sampleData: ChartData<'bar' | 'line' | 'pie'>
  category: string
}

interface DashboardChartsProps {
  analytics: {
    orgScore: number
    messageCount?: number
    alertCount?: number
    totalLeads?: number
    revenue?: number
    activeDeals?: number
    conversionRate?: number
    teamMembers?: number
  }
  t?: (s: string, count?: number) => string
  onBuildChart?: (suggestion: ChartSuggestion) => void
}

// -------------------- Chart Options --------------------
const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        boxWidth: 12,
        font: {
          size: 11,
        },
      },
    },
    title: {
      display: false,
    },
    tooltip: {
      titleFont: {
        size: 12,
      },
      bodyFont: {
        size: 11,
      },
    },
  },
}

const barChartOptions: ChartOptions<'bar'> = {
  ...baseChartOptions,
  scales: {
    x: {
      ticks: {
        font: {
          size: 10,
        },
      },
    },
    y: {
      ticks: {
        font: {
          size: 10,
        },
      },
    },
  },
}

const lineChartOptions: ChartOptions<'line'> = {
  ...baseChartOptions,
  scales: {
    x: {
      ticks: {
        font: {
          size: 10,
        },
      },
    },
    y: {
      ticks: {
        font: {
          size: 10,
        },
      },
    },
  },
}

const pieChartOptions: ChartOptions<'pie'> = {
  ...baseChartOptions,
}

// -------------------- Component --------------------
const DashboardCharts: React.FC<DashboardChartsProps> = ({ analytics, t, onBuildChart }) => {
  const [customCharts, setCustomCharts] = useState<CustomChart[]>([])
  const [showAIBuilder, setShowAIBuilder] = useState(false)

  // Build current (legacy) chart data based on analytics
  const chartData = React.useMemo(() => {
    const revenue = analytics.revenue ?? 150000
    const q = [0.2, 0.3, 0.3, 0.2].map((p) => Math.round(revenue * p))

    return {
      leads: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        data: [55, 72, 68, 84],
      },
      revenue: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        data: q,
      },
      performance: {
        labels: ['Emails', 'Calls', 'Meetings', 'Demos'],
        data: [65, 42, 28, 15],
      },
      inventory: {
        labels: ['Electronics', 'Clothing', 'Books', 'Home'],
        data: [23, 34, 15, 28],
      },
    }
  }, [analytics.revenue])

  // Simple chart data for DashboardChartGrid
  const simpleChartData = {
    sales: {
      labels: chartData.revenue.labels,
      datasets: [
        {
          label: 'Revenue ($)',
          data: chartData.revenue.data,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
      ],
    },
    leads: {
      labels: chartData.leads.labels,
      datasets: [
        {
          data: chartData.leads.data,
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(245, 158, 11, 1)',
          ],
          borderWidth: 1,
        },
      ],
    },
    activity: {
      labels: chartData.revenue.labels,
      datasets: [
        {
          label: 'Activity Level',
          data: chartData.revenue.data,
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
        },
      ],
    },
    orgComparison: {
      labels: chartData.performance.labels,
      datasets: [
        {
          data: chartData.performance.data,
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(99, 102, 241, 0.8)',
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(99, 102, 241, 1)',
          ],
          borderWidth: 1,
        },
      ],
    },
  }

  // Handle AI chart suggestions
  const handleAIChartBuild = (suggestion: ChartSuggestion) => {
    const newChart: CustomChart = {
      id: `ai-chart-${Date.now()}`,
      name: suggestion.title,
      type: suggestion.chartType,
      data: suggestion.sampleData,
      config: suggestion.config,
      position: { x: 0, y: 0, width: 300, height: 200 },
      created: new Date().toISOString(),
      source: 'ai',
      category: suggestion.category,
    }
    setCustomCharts(prev => [...prev, newChart])
    
    if (onBuildChart) {
      onBuildChart(suggestion)
    }
  }

  // Handle charts change from CustomChartsManager
  const handleChartsChange = (newCharts: CustomChart[]) => {
    setCustomCharts(newCharts)
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="text-red-800">
            <h3 className="text-lg font-medium mb-2">Chart Error</h3>
            <p className="text-sm">
              There was an error rendering the charts. Please refresh the page or contact support if the issue persists.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Default Charts Grid */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Dashboard Analytics
          </h3>
          <DashboardChartGrid
            chartData={simpleChartData}
            columns={4}
          />
        </div>

        {/* Custom Charts */}
        <div>
          <CustomChartsManager
            charts={customCharts}
            onChartsChange={handleChartsChange}
            currentData={chartData}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default DashboardCharts
