// Dashboard utility functions

export function scoreLead(lead: any) {
  // Example scoring logic
  return lead.activityScore || 0;
}

export function getSuggestedAction(messages: any[]): string {
  if (!messages || messages.length === 0) return "No actions suggested.";
  const lastMsg = messages[0];
  if (lastMsg && lastMsg.direction === "inbound") {
    return "Follow up with lead.";
  }
  return "Review recent activity.";
}

export function groupBy<T>(arr: T[], key: keyof T) {
  return arr.reduce((acc, item) => {
    const group = String(item[key]);
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function filterMessages(messages: any[], filter: any) {
  // Example filter logic
  return messages.filter(m => m.status === filter.status);
}
