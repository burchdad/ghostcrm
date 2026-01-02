"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/SupabaseAuthContext";
import { Plus, User, DollarSign, Car, Calendar, Building, CheckSquare, Phone, FileText } from "lucide-react";
import Modal from "@/components/ui/Modal";
import "./QuickAddModal.css";

interface QuickAddAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  path: string;
  category: "sales" | "operations" | "general";
}

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to get tenant-aware route based on user role
function getTenantRoute(user: any, basePath: string): string {
  if (!user || !user.role) return basePath;
  
  // Map user roles to their tenant directories
  const roleMapping: Record<string, string> = {
    'owner': 'tenant-owner',
    'admin': 'tenant-admin', 
    'manager': 'tenant-salesmanager',
    'sales_rep': 'tenant-salesrep',
    'user': 'tenant-salesrep' // Default users to sales rep level
  };
  
  const tenantDir = roleMapping[user.role] || 'tenant-salesrep';
  return `/${tenantDir}${basePath}`;
}

// Helper function to get role-specific available actions based on existing pages
function getAvailableActionsForRole(userRole: string): QuickAddAction[] {
  // Define all possible actions
  const allActions: QuickAddAction[] = [
    {
      id: "new-lead",
      label: "New Lead",
      icon: User,
      description: "Add a potential customer",
      path: "/new-lead",
      category: "sales"
    },
    {
      id: "new-deal", 
      label: "New Deal",
      icon: DollarSign,
      description: "Create a new sales opportunity",
      path: "/new-deal",
      category: "sales"
    },
    {
      id: "new-contact",
      label: "New Contact", 
      icon: Phone,
      description: "Add a new contact",
      path: "/new-contact",
      category: "sales"
    },
    {
      id: "new-inventory",
      label: "New Vehicle",
      icon: Car, 
      description: "Add vehicle to inventory",
      path: "/new-inventory",
      category: "operations"
    },
    {
      id: "new-appointment",
      label: "New Appointment",
      icon: Calendar,
      description: "Schedule an appointment", 
      path: "/new-appointment",
      category: "operations"
    },
    {
      id: "new-task",
      label: "New Task",
      icon: CheckSquare,
      description: "Create a task or reminder",
      path: "/new-task", 
      category: "general"
    },
    {
      id: "new-note",
      label: "New Note",
      icon: FileText,
      description: "Quick note or document",
      path: "/new-note",
      category: "general"
    },
    {
      id: "new-company",
      label: "New Company", 
      icon: Building,
      description: "Add a company record",
      path: "/new-company",
      category: "sales"
    }
  ];

  // Return actions based on what pages actually exist for each role
  switch (userRole) {
    case 'owner':
      // Tenant Owner has full page coverage - return available actions
      return allActions.filter(action => 
        ['new-lead', 'new-deal', 'new-inventory'].includes(action.id)
      );
      
    case 'admin':
      // Tenant Admin directory doesn't exist yet, fallback to owner actions
      // TODO: Create tenant-admin pages
      return allActions.filter(action => 
        ['new-lead', 'new-deal', 'new-inventory'].includes(action.id)
      );
      
    case 'manager': 
      // Sales Manager only has leads page, limit to lead creation
      return allActions.filter(action => action.id === 'new-lead');
      
    case 'sales_rep':
    case 'user':
      // Sales Rep only has leads page, limit to lead creation
      return allActions.filter(action => action.id === 'new-lead');
      
    default:
      // Default fallback to lead creation only
      return allActions.filter(action => action.id === 'new-lead');
  }
}

export default function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const router = useRouter();
  const { user } = useAuth();

  if (!isOpen) return null;

  // Get role-specific actions instead of hardcoded list
  const quickAddActions = getAvailableActionsForRole(user?.role || 'sales_rep');

  const handleActionClick = (action: QuickAddAction) => {
    onClose();
    const tenantAwarePath = getTenantRoute(user, action.path);
    router.push(tenantAwarePath);
  };

  // Group actions by category for display
  const groupedActions = {
    sales: quickAddActions.filter(action => action.category === "sales"),
    operations: quickAddActions.filter(action => action.category === "operations"), 
    general: quickAddActions.filter(action => action.category === "general")
  };

  // Only show categories that have actions
  const availableCategories = Object.entries(groupedActions)
    .filter(([_, actions]) => actions.length > 0)
    .map(([category, _]) => category);

  const categoryLabels = {
    sales: "Sales & CRM",
    operations: "Operations", 
    general: "General"
  };

  const categoryGradients = {
    sales: 'linear-gradient(135deg, #059669, #10b981)',
    operations: 'linear-gradient(135deg, #dc2626, #ef4444)',
    general: 'linear-gradient(135deg, #7c3aed, #a855f7)'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Add" width="min(800px, 90vw)">
      {/* Hero Section */}
      <div className="mp-hero">
        <div className="mp-emoji">⚡</div>
        <div className="mp-hero-text">
          <h3>Create New Records</h3>
          <p>Quickly add leads, deals, appointments, and more to your CRM. Choose from the options below to get started.</p>
        </div>
      </div>

      {/* Role Information */}
      {user?.role && (
        <div className="mp-role-info">
          <span className="mp-role-badge">
            {user.role.replace('_', ' ').toUpperCase()} ACTIONS
          </span>
        </div>
      )}

      {/* Actions Grid */}
      <section className="mp-grid">
        {quickAddActions.map((action) => {
          const IconComponent = action.icon;
          const categoryGradient = categoryGradients[action.category as keyof typeof categoryGradients];
          
          return (
            <article 
              key={action.id} 
              className="mp-card" 
              data-category={action.category}
              style={{ '--category-gradient': categoryGradient } as any}
            >
              <header className="mp-card-header">
                <div className="mp-card-icon">
                  <IconComponent />
                </div>
                <div className="mp-card-info">
                  <div className="mp-card-title">{action.label}</div>
                  <div className="mp-card-sub">{action.category}</div>
                </div>
              </header>
              <p className="mp-card-desc">{action.description}</p>
              <button className="mp-link" onClick={() => handleActionClick(action)}>
                Create {action.label} →
              </button>
            </article>
          );
        })}
      </section>

      {/* Show empty state if no actions available */}
      {quickAddActions.length === 0 && (
        <div className="mp-empty-state">
          <div className="mp-empty-icon">🚫</div>
          <h4>No Actions Available</h4>
          <p>Your current role doesn't have permission to create new records. Contact your administrator for access.</p>
        </div>
      )}

      {/* Footer */}
      <section className="mp-divider" aria-hidden="true" />
      <div className="mp-section-head">
        <h4>💡 Quick Tips</h4>
        <p className="mp-quick-tip">Press Ctrl+N anywhere to open this menu</p>
      </div>
    </Modal>
  );
}