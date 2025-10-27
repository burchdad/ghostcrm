"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Plus, User, DollarSign, Car, Calendar, Building, CheckSquare, Phone, FileText } from "lucide-react";
import Modal from "@/components/ui/Modal";

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

export default function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const quickAddActions: QuickAddAction[] = [
    // Sales
    {
      id: "new-lead",
      label: "New Lead",
      icon: User,
      description: "Add a potential customer",
      path: "/leads/new",
      category: "sales"
    },
    {
      id: "new-deal",
      label: "New Deal",
      icon: DollarSign,
      description: "Create a new sales opportunity",
      path: "/deals/new",
      category: "sales"
    },
    {
      id: "new-contact",
      label: "New Contact",
      icon: Phone,
      description: "Add a new contact",
      path: "/contacts/new",
      category: "sales"
    },
    {
      id: "new-company",
      label: "New Company",
      icon: Building,
      description: "Add a company record",
      path: "/companies/new",
      category: "sales"
    },
    // Operations
    {
      id: "new-inventory",
      label: "New Vehicle",
      icon: Car,
      description: "Add vehicle to inventory",
      path: "/inventory/new",
      category: "operations"
    },
    {
      id: "new-appointment",
      label: "New Appointment",
      icon: Calendar,
      description: "Schedule an appointment",
      path: "/calendar/new",
      category: "operations"
    },
    // General
    {
      id: "new-task",
      label: "New Task",
      icon: CheckSquare,
      description: "Create a task or reminder",
      path: "/tasks/new",
      category: "general"
    },
    {
      id: "new-note",
      label: "New Note",
      icon: FileText,
      description: "Quick note or document",
      path: "/notes/new",
      category: "general"
    }
  ];

  const handleActionClick = (action: QuickAddAction) => {
    onClose();
    router.push(action.path);
  };

  const groupedActions = {
    sales: quickAddActions.filter(action => action.category === "sales"),
    operations: quickAddActions.filter(action => action.category === "operations"),
    general: quickAddActions.filter(action => action.category === "general")
  };

  const categoryLabels = {
    sales: "Sales & CRM",
    operations: "Operations",
    general: "General"
  };

  const categoryIcons = {
    sales: "💼",
    operations: "⚙️", 
    general: "📋"
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

      {/* Actions Grid */}
      <section className="mp-grid">
        {quickAddActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <article key={action.id} className="mp-card" style={{ '--category-gradient': 'linear-gradient(135deg, #3b82f6, #1d4ed8)' } as any}>
              <header className="mp-card-header">
                <div className="mp-card-icon">
                  <IconComponent className="w-5 h-5" />
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

      {/* Footer */}
      <section className="mp-divider" aria-hidden="true" />
      <div className="mp-section-head">
        <h4>💡 Quick Tips</h4>
        <p className="text-sm text-gray-500">Press Ctrl+N anywhere to open this menu</p>
      </div>
    </Modal>
  );
}