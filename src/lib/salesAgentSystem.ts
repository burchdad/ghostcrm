// Sales Agent Round-Robin System
export interface SalesAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  isActive: boolean;
  currentLoad: number; // Current number of active leads/appointments
  maxLoad: number; // Maximum concurrent leads
  workingHours: {
    start: string; // "09:00"
    end: string; // "18:00"
  };
  workingDays: number[]; // 0=Sunday, 1=Monday, etc.
  timeZone: string;
  avatar?: string;
  rating: number;
  totalSales: number;
  lastAssignment?: string; // ISO date string
}

export interface TestDriveAppointment {
  id: string;
  vehicleId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  scheduledDateTime: string; // ISO date string
  duration: number; // minutes
  agentId: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  customerPreferences?: {
    preferredTime?: 'morning' | 'afternoon' | 'evening';
    hasTradeIn?: boolean;
    financingInterest?: boolean;
    specificQuestions?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// Sample sales agents data
export const sampleSalesAgents: SalesAgent[] = [
  {
    id: 'SA001',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@dealership.com',
    phone: '(555) 123-4567',
    specialties: ['Luxury Vehicles', 'Electric Vehicles'],
    isActive: true,
    currentLoad: 3,
    maxLoad: 8,
    workingHours: { start: '09:00', end: '18:00' },
    workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    timeZone: 'America/New_York',
    rating: 4.8,
    totalSales: 127,
    lastAssignment: '2024-10-26T14:30:00Z'
  },
  {
    id: 'SA002',
    name: 'Sarah Chen',
    email: 'sarah.chen@dealership.com',
    phone: '(555) 234-5678',
    specialties: ['First-Time Buyers', 'Family Vehicles'],
    isActive: true,
    currentLoad: 2,
    maxLoad: 10,
    workingHours: { start: '08:30', end: '17:30' },
    workingDays: [1, 2, 3, 4, 5],
    timeZone: 'America/New_York',
    rating: 4.9,
    totalSales: 98,
    lastAssignment: '2024-10-25T16:15:00Z'
  },
  {
    id: 'SA003',
    name: 'David Thompson',
    email: 'david.thompson@dealership.com',
    phone: '(555) 345-6789',
    specialties: ['Trucks & SUVs', 'Commercial Vehicles'],
    isActive: true,
    currentLoad: 4,
    maxLoad: 7,
    workingHours: { start: '10:00', end: '19:00' },
    workingDays: [1, 2, 3, 4, 5, 6],
    timeZone: 'America/New_York',
    rating: 4.7,
    totalSales: 156,
    lastAssignment: '2024-10-24T11:45:00Z'
  },
  {
    id: 'SA004',
    name: 'Jennifer Walsh',
    email: 'jennifer.walsh@dealership.com',
    phone: '(555) 456-7890',
    specialties: ['Certified Pre-Owned', 'Trade-Ins'],
    isActive: true,
    currentLoad: 1,
    maxLoad: 9,
    workingHours: { start: '09:30', end: '18:30' },
    workingDays: [1, 2, 3, 4, 5, 6],
    timeZone: 'America/New_York',
    rating: 4.6,
    totalSales: 89,
    lastAssignment: '2024-10-23T09:20:00Z'
  }
];

// Round-robin assignment algorithm
export class SalesAgentRoundRobin {
  private agents: SalesAgent[];

  constructor(agents: SalesAgent[]) {
    this.agents = agents.filter(agent => agent.isActive);
  }

  // Get next available agent based on round-robin with load balancing
  getNextAgent(requestDateTime?: Date, vehicleType?: string): SalesAgent | null {
    const targetDate = requestDateTime || new Date();
    const dayOfWeek = targetDate.getDay();
    const timeString = targetDate.toTimeString().slice(0, 5); // "HH:MM"

    // Filter agents who are working at the requested time
    const availableAgents = this.agents.filter(agent => {
      const isWorkingDay = agent.workingDays.includes(dayOfWeek);
      const isWorkingHours = timeString >= agent.workingHours.start && timeString <= agent.workingHours.end;
      const hasCapacity = agent.currentLoad < agent.maxLoad;
      
      return isWorkingDay && isWorkingHours && hasCapacity;
    });

    if (availableAgents.length === 0) {
      return null; // No agents available
    }

    // Sort by current load (ascending) then by last assignment (oldest first)
    availableAgents.sort((a, b) => {
      if (a.currentLoad !== b.currentLoad) {
        return a.currentLoad - b.currentLoad;
      }
      
      const aLastAssignment = a.lastAssignment ? new Date(a.lastAssignment).getTime() : 0;
      const bLastAssignment = b.lastAssignment ? new Date(b.lastAssignment).getTime() : 0;
      
      return aLastAssignment - bLastAssignment;
    });

    // If vehicle type is specified, prefer agents with matching specialties
    if (vehicleType) {
      const specialistAgents = availableAgents.filter(agent => 
        agent.specialties.some(specialty => 
          specialty.toLowerCase().includes(vehicleType.toLowerCase()) ||
          vehicleType.toLowerCase().includes(specialty.toLowerCase())
        )
      );
      
      if (specialistAgents.length > 0) {
        return specialistAgents[0];
      }
    }

    return availableAgents[0];
  }

  // Assign agent to appointment
  assignAgent(agentId: string, appointmentDateTime: Date): boolean {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return false;

    agent.currentLoad += 1;
    agent.lastAssignment = appointmentDateTime.toISOString();
    return true;
  }

  // Release agent from appointment (when cancelled/completed)
  releaseAgent(agentId: string): boolean {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return false;

    agent.currentLoad = Math.max(0, agent.currentLoad - 1);
    return true;
  }

  // Get agent availability for a specific date range
  getAgentAvailability(agentId: string, startDate: Date, endDate: Date): { date: string; slots: string[] }[] {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return [];

    const availability: { date: string; slots: string[] }[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      
      if (agent.workingDays.includes(dayOfWeek)) {
        const slots: string[] = [];
        const startHour = parseInt(agent.workingHours.start.split(':')[0]);
        const endHour = parseInt(agent.workingHours.end.split(':')[0]);
        
        // Generate 1-hour slots
        for (let hour = startHour; hour < endHour; hour++) {
          slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        
        availability.push({
          date: current.toISOString().split('T')[0],
          slots
        });
      }
      
      current.setDate(current.getDate() + 1);
    }

    return availability;
  }
}

// Utility functions for test drive scheduling
export const testDriveUtils = {
  // Generate available time slots for next 14 days
  getAvailableSlots: (agentSystem: SalesAgentRoundRobin): { date: string; agent: SalesAgent; slots: string[] }[] => {
    const results: { date: string; agent: SalesAgent; slots: string[] }[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) { // Next 14 days
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      
      const dayOfWeek = targetDate.getDay();
      const dateString = targetDate.toISOString().split('T')[0];
      
      // Get all agents working on this day
      const workingAgents = agentSystem['agents'].filter(agent => 
        agent.workingDays.includes(dayOfWeek) && agent.currentLoad < agent.maxLoad
      );
      
      workingAgents.forEach(agent => {
        const slots: string[] = [];
        const startHour = parseInt(agent.workingHours.start.split(':')[0]);
        const endHour = parseInt(agent.workingHours.end.split(':')[0]);
        
        // Generate 1-hour slots, but skip lunch (12-13)
        for (let hour = startHour; hour < endHour; hour++) {
          if (hour !== 12) { // Skip lunch hour
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
          }
        }
        
        if (slots.length > 0) {
          results.push({ date: dateString, agent, slots });
        }
      });
    }
    
    return results;
  },

  // Format appointment confirmation details
  formatAppointmentDetails: (appointment: TestDriveAppointment, agent: SalesAgent, vehicle: any) => {
    const appointmentDate = new Date(appointment.scheduledDateTime);
    return {
      confirmationNumber: `TD-${appointment.id.slice(-6).toUpperCase()}`,
      date: appointmentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: appointmentDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      duration: `${appointment.duration} minutes`,
      vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`,
      agent: {
        name: agent.name,
        phone: agent.phone,
        email: agent.email
      },
      customer: {
        name: appointment.customerName,
        email: appointment.customerEmail,
        phone: appointment.customerPhone
      }
    };
  }
};