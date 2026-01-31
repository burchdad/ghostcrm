"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { useToast } from "@/hooks/use-toast";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  DollarSign,
  Building,
  Star,
  Clock,
  Target,
  TrendingUp,
  Search,
  Plus,
  MoreVertical,
  type LucideIcon,
} from "lucide-react";
import "./page.css";

type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "closed-won"
  | "closed-lost";

type LeadPriority = "low" | "medium" | "high";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  value: number;
  status: LeadStatus;
  priority: LeadPriority;
  lastContact: string;
  nextFollowUp: string;
  source: string;
  score: number;
  notes: string;
}

interface KanbanColumn {
  id: LeadStatus;
  title: string;
  leads: Lead[];
  color: string;
  icon: LucideIcon;
}

const initialColumns: KanbanColumn[] = [
  {
    id: "new",
    title: "New Leads",
    leads: [],
    color: "kanban-column-new",
    icon: Star,
  },
  {
    id: "contacted",
    title: "Contacted",
    leads: [],
    color: "kanban-column-contacted",
    icon: Phone,
  },
  {
    id: "qualified",
    title: "Qualified",
    leads: [],
    color: "kanban-column-qualified",
    icon: Target,
  },
  {
    id: "proposal",
    title: "Proposal Sent",
    leads: [],
    color: "kanban-column-proposal",
    icon: TrendingUp,
  },
  {
    id: "negotiation",
    title: "Negotiation",
    leads: [],
    color: "kanban-column-negotiation",
    icon: DollarSign,
  },
  {
    id: "closed-won",
    title: "Closed Won",
    leads: [],
    color: "kanban-column-closed-won",
    icon: TrendingUp,
  },
  {
    id: "closed-lost",
    title: "Closed Lost",
    leads: [],
    color: "kanban-column-closed-lost",
    icon: Clock,
  },
];

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    company: "Tech Solutions Inc.",
    value: 25000,
    status: "new",
    priority: "high",
    lastContact: "2024-11-10",
    nextFollowUp: "2024-11-13",
    source: "Website",
    score: 85,
    notes: "Interested in enterprise package",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    phone: "+1 (555) 987-6543",
    company: "Marketing Pro LLC",
    value: 15000,
    status: "contacted",
    priority: "medium",
    lastContact: "2024-11-08",
    nextFollowUp: "2024-11-12",
    source: "Referral",
    score: 72,
    notes: "Needs demo scheduled",
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "mike.wilson@corp.com",
    phone: "+1 (555) 456-7890",
    company: "Wilson Corp",
    value: 35000,
    status: "qualified",
    priority: "high",
    lastContact: "2024-11-09",
    nextFollowUp: "2024-11-14",
    source: "LinkedIn",
    score: 90,
    notes: "Ready for proposal",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@startup.io",
    phone: "+1 (555) 321-0987",
    company: "Startup Innovations",
    value: 8000,
    status: "proposal",
    priority: "medium",
    lastContact: "2024-11-07",
    nextFollowUp: "2024-11-15",
    source: "Cold Call",
    score: 68,
    notes: "Reviewing our proposal",
  },
];

type FilterPriority = "all" | LeadPriority;

export default function LeadsKanbanPage() {
  const router = useRouter();
  const { toast } = useToast();
  useRibbonPage({
    context: "leads",
    enable: ["bulkOps", "quickActions", "export", "share"],
    disable: ["saveLayout", "aiTools", "developer", "billing"]
  });

  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Optionally, add logic here if useRibbonPage provides a way to set the page title/description
    // Otherwise, remove this effect if not needed
  }, []);

  useEffect(() => {
    loadLeadsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadLeadsData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const columnsWithLeads: KanbanColumn[] = initialColumns.map((column) => ({
        ...column,
        leads: mockLeads.filter((lead) => lead.status === column.id),
      }));

      setColumns(columnsWithLeads);
    } catch (error) {
      console.error("Error loading leads:", error);
      toast({
        title: "Error",
        description: "Failed to load leads data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destColumn = columns.find((col) => col.id === destination.droppableId);
    const leadToMove = sourceColumn?.leads.find((lead) => lead.id === draggableId);

    if (!sourceColumn || !destColumn || !leadToMove) {
      return;
    }

    const updatedLead: Lead = {
      ...leadToMove,
      status: destination.droppableId as LeadStatus,
    };

    const newColumns = columns.map((column) => {
      if (column.id === source.droppableId) {
        return {
          ...column,
          leads: column.leads.filter((lead) => lead.id !== draggableId),
        };
      }
      if (column.id === destination.droppableId) {
        const newLeads = Array.from(column.leads);
        newLeads.splice(destination.index, 0, updatedLead);
        return {
          ...column,
          leads: newLeads,
        };
      }
      return column;
    });

    setColumns(newColumns);

    toast({
      title: "Lead Updated",
      description: `${leadToMove.name} moved to ${destColumn.title}`,
    });
  };

  const getPriorityColor = (priority: LeadPriority) => {
    switch (priority) {
      case "high":
        return "kanban-priority-high";
      case "medium":
        return "kanban-priority-medium";
      case "low":
        return "kanban-priority-low";
      default:
        return "kanban-priority-medium";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "kanban-score-high";
    if (score >= 60) return "kanban-score-medium";
    return "kanban-score-low";
  };

  if (loading) {
    return (
      <div className="kanban-loading">
        <div className="kanban-loading-skeleton">
          <div className="kanban-loading-title" />
          <div className="kanban-loading-grid">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="kanban-loading-column">
                <div className="kanban-loading-header" />
                <div className="kanban-loading-cards">
                  <div className="kanban-loading-card" />
                  <div className="kanban-loading-card" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Optional: filter leads by search/priority before rendering
  const visibleColumns = columns.map((column) => ({
    ...column,
    leads: column.leads.filter((lead) => {
      const matchesPriority =
        filterPriority === "all" || lead.priority === filterPriority;
      const matchesSearch =
        !searchTerm ||
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesPriority && matchesSearch;
    }),
  }));

  return (
    <div className="leads-kanban-page">
      {/* Header */}
      <div className="kanban-header">
        <div className="kanban-header-content">
          <h1 className="kanban-title">Leads Pipeline</h1>
          <p className="kanban-subtitle">
            Drag and drop leads to update their status
          </p>
        </div>

        <div className="kanban-controls">
          {/* Search */}
          <div className="kanban-search-container">
            <Search className="kanban-search-icon" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="kanban-search-input"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
            className="kanban-filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <button
            type="button"
            onClick={() => router.push("/leads/create")}
            className="kanban-new-lead-btn"
          >
            <Plus />
            New Lead
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {visibleColumns.map((column) => {
            const IconComponent = column.icon;
            return (
              <div key={column.id} className="kanban-column">
                {/* Column Header */}
                <div className={`kanban-column-header ${column.color}`}>
                  <div className="kanban-column-header-content">
                    <div className="kanban-column-title-section">
                      <IconComponent className="kanban-column-icon" />
                      <h3 className="kanban-column-title">
                        {column.title}
                      </h3>
                    </div>
                    <span className="kanban-column-count">
                      {column.leads.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`kanban-column-content ${
                        snapshot.isDraggingOver ? "drag-over" : ""
                      }`}
                    >
                      {column.leads.map((lead, index) => (
                        <Draggable
                          key={lead.id}
                          draggableId={lead.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`kanban-lead-card ${
                                snapshot.isDragging ? "dragging" : ""
                              }`}
                            >
                              <CardContent className="kanban-lead-card-content">
                                {/* Lead Header */}
                                <div className="kanban-lead-header">
                                  <div className="kanban-lead-info">
                                    <h4 className="kanban-lead-name">
                                      {lead.name}
                                    </h4>
                                    <div className="kanban-lead-company">
                                      <Building />
                                      {lead.company}
                                    </div>
                                  </div>
                                  <div className="kanban-lead-meta">
                                    <span
                                      className={`kanban-priority-badge ${getPriorityColor(
                                        lead.priority
                                      )}`}
                                    >
                                      {lead.priority}
                                    </span>
                                    <span
                                      className={`kanban-lead-score ${getScoreColor(
                                        lead.score
                                      )}`}
                                    >
                                      {lead.score}%
                                    </span>
                                  </div>
                                </div>

                                {/* Lead Value */}
                                <div className="kanban-lead-value">
                                  <DollarSign />
                                  <span className="kanban-lead-value-amount">
                                    ${lead.value.toLocaleString()}
                                  </span>
                                </div>

                                {/* Contact Info */}
                                <div className="kanban-contact-info">
                                  <div className="kanban-contact-row">
                                    <Mail />
                                    <span className="kanban-contact-text">
                                      {lead.email}
                                    </span>
                                  </div>
                                  <div className="kanban-contact-row">
                                    <Phone />
                                    <span className="kanban-contact-text">{lead.phone}</span>
                                  </div>
                                </div>

                                {/* Follow-up Date */}
                                <div className="kanban-followup">
                                  <Calendar />
                                  <span>
                                    Next:{" "}
                                    {new Date(
                                      lead.nextFollowUp
                                    ).toLocaleDateString()}
                                  </span>
                                </div>

                                {/* Notes */}
                                {lead.notes && (
                                  <p className="kanban-notes">
                                    {lead.notes}
                                  </p>
                                )}

                                {/* Action Buttons */}
                                <div className="kanban-actions">
                                  <div className="kanban-action-buttons">
                                    <button
                                      type="button"
                                      className="kanban-action-btn phone"
                                    >
                                      <Phone />
                                    </button>
                                    <button
                                      type="button"
                                      className="kanban-action-btn email"
                                    >
                                      <Mail />
                                    </button>
                                    <button
                                      type="button"
                                      className="kanban-action-btn message"
                                    >
                                      <MessageSquare />
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    className="kanban-action-btn more"
                                  >
                                    <MoreVertical />
                                  </button>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Add New Lead to Column */}
                      <button
                        type="button"
                        onClick={() => {
                          // TODO: open modal or route to create lead pre-filled with this column's status
                        }}
                        className="kanban-add-lead-btn"
                      >
                        <Plus />
                        Add Lead
                      </button>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
