"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

interface WhiteboardElement {
  id: string;
  type: "rectangle" | "circle" | "line" | "arrow" | "text" | "sticky" | "image";
  x: number;
  y: number;
  width?: number;
  height?: number;
  endX?: number;
  endY?: number;
  text?: string;
  color: string;
  backgroundColor?: string;
  strokeWidth: number;
  fontSize?: number;
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

interface WhiteboardCursor {
  userId: string;
  userName: string;
  userAvatar: string;
  x: number;
  y: number;
  color: string;
  lastSeen: string;
}

interface CollaborativeWhiteboardProps {
  isOpen: boolean;
  onClose: () => void;
  entityType?: string;
  entityId?: string;
  onStartVideoCall?: (participants?: Array<{
    id: string;
    name: string;
    avatar: string;
    isMuted?: boolean;
    isVideoOff?: boolean;
    connectionQuality?: "excellent" | "good" | "fair" | "poor";
  }>) => void;
  className?: string;
}

type Tool = "select" | "rectangle" | "circle" | "line" | "arrow" | "text" | "sticky" | "pan" | "eraser";

export default function CollaborativeWhiteboard({
  isOpen,
  onClose,
  entityType = "deal",
  entityId = "123",
  onStartVideoCall,
  className = ""
}: CollaborativeWhiteboardProps) {
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState("#3B82F6");
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(2);
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [collaborators, setCollaborators] = useState<WhiteboardCursor[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Predefined colors
  const colors = [
    "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
    "#EC4899", "#F97316", "#06B6D4", "#84CC16", "#6B7280"
  ];

  // Initialize empty collaborators
  useEffect(() => {
    setCollaborators([]);
  }, []);

  // Template library
  const templates = [
    {
      id: "sales_funnel",
      name: "Sales Funnel",
      preview: "🔽",
      elements: [
        { type: "rectangle", x: 100, y: 50, width: 200, height: 60, text: "Leads", color: "#3B82F6" },
        { type: "rectangle", x: 120, y: 150, width: 160, height: 60, text: "Qualified", color: "#10B981" },
        { type: "rectangle", x: 140, y: 250, width: 120, height: 60, text: "Proposals", color: "#F59E0B" },
        { type: "rectangle", x: 160, y: 350, width: 80, height: 60, text: "Closed", color: "#EF4444" }
      ]
    },
    {
      id: "process_flow",
      name: "Process Flow",
      preview: "→",
      elements: [
        { type: "circle", x: 50, y: 150, width: 60, height: 60, text: "Start", color: "#10B981" },
        { type: "rectangle", x: 150, y: 130, width: 100, height: 40, text: "Process 1", color: "#3B82F6" },
        { type: "rectangle", x: 300, y: 130, width: 100, height: 40, text: "Process 2", color: "#3B82F6" },
        { type: "circle", x: 450, y: 150, width: 60, height: 60, text: "End", color: "#EF4444" }
      ]
    },
    {
      id: "mind_map",
      name: "Mind Map",
      preview: "🧠",
      elements: [
        { type: "circle", x: 200, y: 200, width: 100, height: 100, text: "Main Idea", color: "#8B5CF6" },
        { type: "circle", x: 100, y: 100, width: 80, height: 80, text: "Branch 1", color: "#3B82F6" },
        { type: "circle", x: 300, y: 100, width: 80, height: 80, text: "Branch 2", color: "#10B981" },
        { type: "circle", x: 100, y: 300, width: 80, height: 80, text: "Branch 3", color: "#F59E0B" },
        { type: "circle", x: 300, y: 300, width: 80, height: 80, text: "Branch 4", color: "#EF4444" }
      ]
    }
  ];

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: WhiteboardElement) => {
    ctx.strokeStyle = element.color;
    ctx.fillStyle = element.backgroundColor || element.color;
    ctx.lineWidth = element.strokeWidth;

    switch (element.type) {
      case "rectangle":
        ctx.strokeRect(element.x, element.y, element.width || 0, element.height || 0);
        if (element.backgroundColor) {
          ctx.fillRect(element.x, element.y, element.width || 0, element.height || 0);
        }
        if (element.text) {
          ctx.fillStyle = "#000";
          ctx.font = `${element.fontSize || 14}px Arial`;
          ctx.textAlign = "center";
          ctx.fillText(
            element.text,
            element.x + (element.width || 0) / 2,
            element.y + (element.height || 0) / 2 + 5
          );
        }
        break;

      case "circle":
        const radius = Math.min(element.width || 0, element.height || 0) / 2;
        ctx.beginPath();
        ctx.arc(
          element.x + (element.width || 0) / 2,
          element.y + (element.height || 0) / 2,
          radius,
          0,
          2 * Math.PI
        );
        ctx.stroke();
        if (element.backgroundColor) {
          ctx.fill();
        }
        if (element.text) {
          ctx.fillStyle = "#000";
          ctx.font = `${element.fontSize || 14}px Arial`;
          ctx.textAlign = "center";
          ctx.fillText(
            element.text,
            element.x + (element.width || 0) / 2,
            element.y + (element.height || 0) / 2 + 5
          );
        }
        break;

      case "line":
        ctx.beginPath();
        ctx.moveTo(element.x, element.y);
        ctx.lineTo(element.endX || element.x, element.endY || element.y);
        ctx.stroke();
        break;

      case "arrow":
        const headLength = 15;
        const angle = Math.atan2((element.endY || 0) - element.y, (element.endX || 0) - element.x);
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(element.x, element.y);
        ctx.lineTo(element.endX || element.x, element.endY || element.y);
        ctx.stroke();
        
        // Draw arrowhead
        ctx.beginPath();
        ctx.moveTo(element.endX || element.x, element.endY || element.y);
        ctx.lineTo(
          (element.endX || element.x) - headLength * Math.cos(angle - Math.PI / 6),
          (element.endY || element.y) - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(element.endX || element.x, element.endY || element.y);
        ctx.lineTo(
          (element.endX || element.x) - headLength * Math.cos(angle + Math.PI / 6),
          (element.endY || element.y) - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;

      case "text":
        ctx.fillStyle = element.color;
        ctx.font = `${element.fontSize || 16}px Arial`;
        ctx.textAlign = "left";
        ctx.fillText(element.text || "", element.x, element.y);
        break;

      case "sticky":
        // Draw sticky note background
        ctx.fillStyle = element.backgroundColor || "#FEF3C7";
        ctx.fillRect(element.x, element.y, element.width || 100, element.height || 100);
        ctx.strokeStyle = "#D97706";
        ctx.strokeRect(element.x, element.y, element.width || 100, element.height || 100);
        
        // Draw text
        if (element.text) {
          ctx.fillStyle = "#000";
          ctx.font = `${element.fontSize || 12}px Arial`;
          ctx.textAlign = "left";
          const words = element.text.split(' ');
          let line = '';
          let y = element.y + 20;
          const maxWidth = (element.width || 100) - 10;
          
          words.forEach(word => {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
              ctx.fillText(line, element.x + 5, y);
              line = word + ' ';
              y += 15;
            } else {
              line = testLine;
            }
          });
          ctx.fillText(line, element.x + 5, y);
        }
        break;
    }

    // Draw selection border if selected
    if (selectedElement === element.id) {
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        element.x - 5,
        element.y - 5,
        (element.width || 0) + 10,
        (element.height || 0) + 10
      );
      ctx.setLineDash([]);
    }
  }, [selectedElement]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transformations
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(panOffset.x, panOffset.y);

    // Draw grid
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x < canvas.width / scale; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height / scale);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height / scale; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width / scale, y);
      ctx.stroke();
    }

    // Draw elements
    elements.forEach(element => drawElement(ctx, element));

    // Draw collaborator cursors
    collaborators.forEach(cursor => {
      ctx.fillStyle = cursor.color;
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw user name
      ctx.fillStyle = "#000";
      ctx.font = "12px Arial";
      ctx.textAlign = "left";
      ctx.fillText(`${cursor.userAvatar} ${cursor.userName}`, cursor.x + 10, cursor.y - 5);
    });

    ctx.restore();
  }, [elements, collaborators, scale, panOffset, drawElement]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x * scale) / scale;
    const y = (e.clientY - rect.top - panOffset.y * scale) / scale;

    if (activeTool === "pan") {
      setIsPanning(true);
      setStartPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (activeTool === "select") {
      // Find clicked element
      const clickedElement = elements.find(element => {
        if (element.type === "rectangle" || element.type === "sticky") {
          return x >= element.x && x <= element.x + (element.width || 0) &&
                 y >= element.y && y <= element.y + (element.height || 0);
        }
        if (element.type === "circle") {
          const centerX = element.x + (element.width || 0) / 2;
          const centerY = element.y + (element.height || 0) / 2;
          const radius = Math.min(element.width || 0, element.height || 0) / 2;
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          return distance <= radius;
        }
        return false;
      });

      setSelectedElement(clickedElement?.id || null);
      return;
    }

    setIsDrawing(true);
    setStartPoint({ x, y });

    if (activeTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        const newElement: WhiteboardElement = {
          id: `element_${Date.now()}`,
          type: "text",
          x,
          y,
          text,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          fontSize: 16,
          createdBy: "current_user",
          createdAt: new Date().toISOString(),
          lastModifiedBy: "current_user",
          lastModifiedAt: new Date().toISOString()
        };
        setElements(prev => [...prev, newElement]);
      }
      setIsDrawing(false);
      return;
    }

    if (activeTool === "sticky") {
      const text = prompt("Enter sticky note text:");
      if (text) {
        const newElement: WhiteboardElement = {
          id: `element_${Date.now()}`,
          type: "sticky",
          x,
          y,
          width: 120,
          height: 120,
          text,
          color: "#D97706",
          backgroundColor: "#FEF3C7",
          strokeWidth: 1,
          fontSize: 12,
          createdBy: "current_user",
          createdAt: new Date().toISOString(),
          lastModifiedBy: "current_user",
          lastModifiedAt: new Date().toISOString()
        };
        setElements(prev => [...prev, newElement]);
      }
      setIsDrawing(false);
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isPanning) {
      const deltaX = (e.clientX - startPoint.x) / scale;
      const deltaY = (e.clientY - startPoint.y) / scale;
      setPanOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setStartPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x * scale) / scale;
    const y = (e.clientY - rect.top - panOffset.y * scale) / scale;

    // Update preview for current drawing
    if (activeTool === "rectangle" || activeTool === "circle") {
      const width = x - startPoint.x;
      const height = y - startPoint.y;
      
      // Update temporary element for preview
      setElements(prev => {
        const filtered = prev.filter(el => !el.id.startsWith("temp_"));
        const tempElement: WhiteboardElement = {
          id: "temp_preview",
          type: activeTool,
          x: Math.min(startPoint.x, x),
          y: Math.min(startPoint.y, y),
          width: Math.abs(width),
          height: Math.abs(height),
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          createdBy: "current_user",
          createdAt: new Date().toISOString(),
          lastModifiedBy: "current_user",
          lastModifiedAt: new Date().toISOString()
        };
        return [...filtered, tempElement];
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x * scale) / scale;
    const y = (e.clientY - rect.top - panOffset.y * scale) / scale;

    // Remove temporary preview
    setElements(prev => prev.filter(el => el.id !== "temp_preview"));

    if (activeTool === "line" || activeTool === "arrow") {
      const newElement: WhiteboardElement = {
        id: `element_${Date.now()}`,
        type: activeTool,
        x: startPoint.x,
        y: startPoint.y,
        endX: x,
        endY: y,
        color: currentColor,
        strokeWidth: currentStrokeWidth,
        createdBy: "current_user",
        createdAt: new Date().toISOString(),
        lastModifiedBy: "current_user",
        lastModifiedAt: new Date().toISOString()
      };
      setElements(prev => [...prev, newElement]);
    } else if (activeTool === "rectangle" || activeTool === "circle") {
      const width = Math.abs(x - startPoint.x);
      const height = Math.abs(y - startPoint.y);
      
      if (width > 5 && height > 5) { // Minimum size check
        const newElement: WhiteboardElement = {
          id: `element_${Date.now()}`,
          type: activeTool,
          x: Math.min(startPoint.x, x),
          y: Math.min(startPoint.y, y),
          width,
          height,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          createdBy: "current_user",
          createdAt: new Date().toISOString(),
          lastModifiedBy: "current_user",
          lastModifiedAt: new Date().toISOString()
        };
        setElements(prev => [...prev, newElement]);
      }
    }

    setIsDrawing(false);
  };

  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.1, Math.min(3, prev + delta)));
  };

  const clearCanvas = () => {
    if (confirm("Are you sure you want to clear the entire whiteboard?")) {
      setElements([]);
      setSelectedElement(null);
    }
  };

  const deleteSelected = () => {
    if (selectedElement) {
      setElements(prev => prev.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newElements = template.elements.map((el, index) => ({
        id: `template_${Date.now()}_${index}`,
        type: el.type as WhiteboardElement["type"],
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        text: el.text,
        color: el.color,
        strokeWidth: 2,
        createdBy: "current_user",
        createdAt: new Date().toISOString(),
        lastModifiedBy: "current_user",
        lastModifiedAt: new Date().toISOString()
      }));
      setElements(prev => [...prev, ...newElements]);
      setShowTemplates(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${className}`}>
      <div className="absolute inset-1 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div>
            <h3 className="font-semibold text-slate-800">Collaborative Whiteboard</h3>
            <p className="text-sm text-slate-600">Real-time visual collaboration</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
            >
              📋 Templates
            </button>
            <button
              onClick={() => setShowLayers(!showLayers)}
              className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
            >
              📚 Layers
            </button>
            <button
              onClick={clearCanvas}
              className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm text-red-600"
            >
              🗑️ Clear
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Toolbar */}
          <div className="w-16 border-r border-slate-200 bg-slate-50 p-2 flex flex-col gap-2">
            {[
              { tool: "select" as Tool, icon: "↖️", title: "Select" },
              { tool: "rectangle" as Tool, icon: "⬜", title: "Rectangle" },
              { tool: "circle" as Tool, icon: "⭕", title: "Circle" },
              { tool: "line" as Tool, icon: "📏", title: "Line" },
              { tool: "arrow" as Tool, icon: "➡️", title: "Arrow" },
              { tool: "text" as Tool, icon: "🔤", title: "Text" },
              { tool: "sticky" as Tool, icon: "📝", title: "Sticky Note" },
              { tool: "pan" as Tool, icon: "✋", title: "Pan" },
              { tool: "eraser" as Tool, icon: "🧽", title: "Eraser" }
            ].map(({ tool, icon, title }) => (
              <button
                key={tool}
                onClick={() => setActiveTool(tool)}
                className={`p-3 rounded-lg text-xl transition-colors ${
                  activeTool === tool
                    ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                    : "hover:bg-slate-200 border-2 border-transparent"
                }`}
                title={title}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 relative overflow-hidden" ref={containerRef}>
            <canvas
              ref={canvasRef}
              width={1200}
              height={800}
              className="absolute inset-0 cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={(e) => {
                e.preventDefault();
                handleZoom(e.deltaY > 0 ? -0.1 : 0.1);
              }}
            />

            {/* Floating Controls */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <div className="bg-white rounded-lg shadow-lg p-2 flex items-center gap-2">
                <span className="text-sm text-slate-600">Zoom:</span>
                <button
                  onClick={() => handleZoom(-0.1)}
                  className="w-8 h-8 bg-slate-100 rounded hover:bg-slate-200"
                >
                  -
                </button>
                <span className="text-sm font-medium min-w-[3rem] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => handleZoom(0.1)}
                  className="w-8 h-8 bg-slate-100 rounded hover:bg-slate-200"
                >
                  +
                </button>
                <button
                  onClick={() => setScale(1)}
                  className="px-2 py-1 bg-slate-100 rounded hover:bg-slate-200 text-sm"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Color Picker */}
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
              <div className="text-sm font-medium text-slate-700 mb-2">Colors</div>
              <div className="grid grid-cols-5 gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={`w-8 h-8 rounded border-2 ${
                      currentColor === color ? "border-slate-800" : "border-slate-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              <div className="mt-3">
                <div className="text-sm font-medium text-slate-700 mb-1">Stroke Width</div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentStrokeWidth}
                  onChange={(e) => setCurrentStrokeWidth(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-slate-500 text-center">{currentStrokeWidth}px</div>
              </div>
            </div>

            {/* Collaborators */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
              <div className="text-sm font-medium text-slate-700 mb-2">Collaborators</div>
              <div className="space-y-2">
                {collaborators.map(collab => (
                  <div key={collab.userId} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: collab.color }}
                    />
                    <span className="text-sm">{collab.userAvatar} {collab.userName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Templates Panel */}
        {showTemplates && (
          <div className="absolute right-0 top-16 bottom-0 w-80 bg-white border-l border-slate-200 shadow-lg p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-slate-800">Templates</h4>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => loadTemplate(template.id)}
                  className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{template.preview}</span>
                    <div>
                      <div className="font-medium text-slate-800">{template.name}</div>
                      <div className="text-sm text-slate-500">Click to add to whiteboard</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Layers Panel */}
        {showLayers && (
          <div className="absolute right-0 top-16 bottom-0 w-80 bg-white border-l border-slate-200 shadow-lg p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-slate-800">Layers ({elements.length})</h4>
              <button
                onClick={() => setShowLayers(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2">
              {elements.slice().reverse().map((element, index) => (
                <div
                  key={element.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedElement === element.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedElement(element.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm capitalize">
                        {element.type} {element.text && `- "${element.text.substring(0, 20)}..."`}
                      </div>
                      <div className="text-xs text-slate-500">
                        by {element.createdBy === "current_user" ? "You" : element.createdBy}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedElement === element.id) {
                            deleteSelected();
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {elements.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-2xl mb-2">🎨</div>
                  <div>No elements yet</div>
                  <div className="text-sm">Start drawing!</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}