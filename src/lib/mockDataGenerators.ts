// Mock data generators for reports to reduce bundle size
// Instead of large static arrays, we generate data dynamically

export const generateActivityData = (days: number = 30) => {
  const data = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < Math.min(days, 11); i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * Math.floor(days / 11));
    
    const calls = Math.floor(Math.random() * 40) + 20;
    const emails = Math.floor(Math.random() * 60) + 40;
    const meetings = Math.floor(Math.random() * 20) + 10;
    const tasks = Math.floor(Math.random() * 40) + 30;
    
    data.push({
      date: `${months[date.getMonth()]} ${date.getDate()}`,
      calls,
      emails,
      meetings,
      tasks,
      total: calls + emails + meetings + tasks
    });
  }
  
  return data;
};

export const generateTeamData = (count: number = 8) => {
  const names = ['Sarah Johnson', 'Mike Chen', 'Emily Davis', 'David Wilson', 'Lisa Garcia', 'Tom Anderson', 'Jessica Lee', 'Chris Martinez'];
  const roles = ['Senior Sales Rep', 'Sales Rep', 'Account Manager', 'Lead Qualifier', 'Inside Sales'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: names[i] || `Team Member ${i + 1}`,
    role: roles[i % roles.length],
    totalActivities: Math.floor(Math.random() * 200) + 200,
    completed: Math.floor(Math.random() * 150) + 150,
    pending: Math.floor(Math.random() * 60) + 20,
    completionRate: Math.floor(Math.random() * 20) + 70,
    avgResponseTime: Math.round((Math.random() * 3 + 1) * 10) / 10
  }));
};

export const generateActivityBreakdown = () => {
  const types = [
    { type: 'Calls', color: '#3B82F6' },
    { type: 'Emails', color: '#10B981' },
    { type: 'Meetings', color: '#F59E0B' },
    { type: 'Tasks', color: '#EF4444' }
  ];
  
  const total = 100;
  let remaining = total;
  
  return types.map((type, index) => {
    const count = index === types.length - 1 ? remaining : Math.floor(Math.random() * (remaining / 2)) + 5;
    remaining -= count;
    
    return {
      ...type,
      count,
      percentage: count,
      // Add index signature for recharts compatibility
      [type.type.toLowerCase()]: count
    };
  });
};

export const generateCustomReports = (count: number = 6) => {
  const reportTypes = ['Lead Analysis', 'Sales Performance', 'Revenue Tracking', 'Customer Insights', 'Activity Summary', 'Conversion Metrics'];
  const statuses = ['active', 'draft', 'scheduled'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: reportTypes[i] || `Custom Report ${i + 1}`,
    description: `Detailed analysis report for ${reportTypes[i]?.toLowerCase() || 'business metrics'}`,
    created: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastRun: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: statuses[i % statuses.length] as 'active' | 'draft' | 'scheduled',
    schedule: i % 3 === 0 ? 'daily' : i % 3 === 1 ? 'weekly' : 'monthly'
  }));
};

export const generateScheduledReports = (count: number = 5) => {
  const frequencies = ['daily', 'weekly', 'monthly', 'quarterly'];
  const statuses = ['active', 'paused', 'completed'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Scheduled Report ${i + 1}`,
    description: `Automated ${frequencies[i % frequencies.length]} report`,
    frequency: frequencies[i % frequencies.length] as 'daily' | 'weekly' | 'monthly' | 'quarterly',
    nextRun: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastRun: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: statuses[i % statuses.length] as 'active' | 'paused' | 'completed',
    recipients: Math.floor(Math.random() * 5) + 1
  }));
};