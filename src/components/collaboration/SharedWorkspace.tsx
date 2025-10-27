"use client";
import React, { useState, useRef, useEffect } from "react";

interface WorkspaceDocument {
  id: string;
  title: string;
  content: string;
  type: "note" | "proposal" | "contract" | "presentation" | "spreadsheet";
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
  collaborators: Array<{
    userId: string;
    name: string;
    avatar: string;
    permission: "view" | "edit" | "admin";
    isActive: boolean;
    cursor?: { line: number; column: number };
  }>;
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: string;
    position: { line: number; column: number };
    resolved: boolean;
  }>;
  versions: Array<{
    id: string;
    version: number;
    createdBy: string;
    createdAt: string;
    changes: string;
  }>;
  tags: string[];
  isLocked: boolean;
  lockedBy?: string;
}

interface SharedWorkspaceProps {
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

export default function SharedWorkspace({ 
  isOpen, 
  onClose, 
  entityType = "deal", 
  entityId = "123",
  onStartVideoCall,
  className = "" 
}: SharedWorkspaceProps) {
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [activeDocument, setActiveDocument] = useState<string>("");
  const [documentContent, setDocumentContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [newDocumentModal, setNewDocumentModal] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState("");
  const [newDocumentType, setNewDocumentType] = useState<WorkspaceDocument["type"]>("note");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Initialize empty state
  useEffect(() => {
    setDocuments([]);
  }, []);

  const documentTemplates = [
    { id: "proposal", name: "Sales Proposal", icon: "📋", description: "Create a professional sales proposal" },
    { id: "contract", name: "Service Contract", icon: "📄", description: "Standard service agreement template" },
    { id: "meeting_notes", name: "Meeting Notes", icon: "📝", description: "Structured meeting notes format" },
    { id: "presentation", name: "Presentation", icon: "📊", description: "Slide-based presentation" },
    { id: "blank", name: "Blank Document", icon: "📃", description: "Start with an empty document" }
  ];

  const handleCreateDocument = () => {
    if (!newDocumentTitle.trim()) return;

    const newDoc: WorkspaceDocument = {
      id: `doc_${Date.now()}`,
      title: newDocumentTitle,
      content: getTemplateContent(selectedTemplate),
      type: newDocumentType,
      createdBy: "current_user",
      createdAt: new Date().toISOString(),
      lastModifiedBy: "current_user",
      lastModifiedAt: new Date().toISOString(),
      collaborators: [
        {
          userId: "current_user",
          name: "You",
          avatar: "👤",
          permission: "admin",
          isActive: true
        }
      ],
      comments: [],
      versions: [
        {
          id: "v1",
          version: 1,
          createdBy: "current_user",
          createdAt: new Date().toISOString(),
          changes: "Document created"
        }
      ],
      tags: [],
      isLocked: false
    };

    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocument(newDoc.id);
    setDocumentContent(newDoc.content);
    setNewDocumentModal(false);
    setNewDocumentTitle("");
    setSelectedTemplate("");
  };

  const getTemplateContent = (templateId: string): string => {
    switch (templateId) {
      case "proposal":
        return `# [Proposal Title]

## Executive Summary
[Brief overview of the proposal]

## Problem Statement
[What problem are we solving?]

## Proposed Solution
[How will we solve it?]

## Benefits
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

## Timeline
[Implementation timeline]

## Investment
[Pricing and costs]

## Next Steps
[What happens next?]`;
      case "meeting_notes":
        return `# [Meeting Title]
**Date:** [Date]
**Attendees:** [List attendees]

## Agenda
- [Item 1]
- [Item 2]
- [Item 3]

## Discussion Points
[Key discussion items]

## Decisions Made
[Important decisions]

## Action Items
- [ ] [Action 1] - [Owner] - [Due Date]
- [ ] [Action 2] - [Owner] - [Due Date]

## Next Meeting
[Date and agenda for next meeting]`;
      default:
        return "";
    }
  };

  const handleDocumentChange = (content: string) => {
    setDocumentContent(content);
    
    // Update document in state
    setDocuments(prev => prev.map(doc => 
      doc.id === activeDocument 
        ? { 
            ...doc, 
            content, 
            lastModifiedBy: "current_user",
            lastModifiedAt: new Date().toISOString()
          }
        : doc
    ));
  };

  const currentDocument = documents.find(doc => doc.id === activeDocument);

  const renderDocumentList = () => (
    <div className="w-80 border-r border-slate-200 bg-slate-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800">Shared Workspace</h3>
          <button
            onClick={() => setNewDocumentModal(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            + New
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full px-3 py-2 pl-8 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <span className="absolute left-2 top-2.5 text-slate-400">🔍</span>
        </div>
      </div>
      
      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-2">
        {documents
          .filter(doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(doc => (
            <button
              key={doc.id}
              onClick={() => {
                setActiveDocument(doc.id);
                setDocumentContent(doc.content);
              }}
              className={`w-full p-3 mb-2 rounded-lg text-left hover:bg-white transition-colors ${
                activeDocument === doc.id ? 'bg-white shadow-sm border border-slate-200' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg mt-0.5">
                  {doc.type === "proposal" && "📋"}
                  {doc.type === "note" && "📝"}
                  {doc.type === "contract" && "📄"}
                  {doc.type === "presentation" && "📊"}
                  {doc.type === "spreadsheet" && "📈"}
                </span>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 text-sm truncate">{doc.title}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Modified by {doc.lastModifiedBy === "current_user" ? "You" : doc.lastModifiedBy}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(doc.lastModifiedAt).toLocaleDateString()}
                  </div>
                  
                  {/* Collaborators */}
                  <div className="flex items-center gap-1 mt-2">
                    {doc.collaborators.slice(0, 3).map(collab => (
                      <div
                        key={collab.userId}
                        className={`w-5 h-5 rounded-full border-2 ${
                          collab.isActive ? 'border-green-400' : 'border-slate-300'
                        } bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs`}
                        title={`${collab.name} - ${collab.permission}`}
                      >
                        {collab.avatar}
                      </div>
                    ))}
                    {doc.collaborators.length > 3 && (
                      <span className="text-xs text-slate-500">+{doc.collaborators.length - 3}</span>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 2 && (
                        <span className="text-xs text-slate-500">+{doc.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
                
                {doc.isLocked && (
                  <span className="text-yellow-600" title="Document is locked">🔒</span>
                )}
              </div>
            </button>
          ))}
      </div>
    </div>
  );

  const renderEditor = () => {
    if (!currentDocument) return null;

    return (
      <div className="flex-1 flex flex-col">
        {/* Document Header */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={currentDocument.title}
                onChange={(e) => {
                  setDocuments(prev => prev.map(doc => 
                    doc.id === activeDocument 
                      ? { ...doc, title: e.target.value }
                      : doc
                  ));
                }}
                className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
              />
              
              {currentDocument.isLocked && (
                <span className="text-yellow-600 text-sm" title="Document is locked">
                  🔒 Locked by {currentDocument.lockedBy}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                📚 History
              </button>
              <button
                onClick={() => setShowCollaborators(!showCollaborators)}
                className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                👥 Share
              </button>
              <button className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50">
                💾 Save
              </button>
              <button className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50">
                📤 Export
              </button>
            </div>
          </div>
          
          {/* Collaborators bar */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-slate-600">Collaborating:</span>
            {currentDocument.collaborators.map(collab => (
              <div
                key={collab.userId}
                className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs ${
                  collab.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <span>{collab.avatar}</span>
                <span>{collab.name}</span>
                {collab.isActive && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
              </div>
            ))}
          </div>
        </div>
        
        {/* Editor */}
        <div className="flex-1 relative">
          <textarea
            ref={editorRef}
            value={documentContent}
            onChange={(e) => handleDocumentChange(e.target.value)}
            disabled={currentDocument.isLocked && currentDocument.lockedBy !== "current_user"}
            className="w-full h-full p-6 resize-none border-none focus:outline-none font-mono text-sm leading-relaxed disabled:bg-slate-50 disabled:text-slate-500"
            placeholder="Start typing your document..."
          />
          
          {/* Live cursors would go here */}
          {currentDocument.collaborators
            .filter(collab => collab.isActive && collab.cursor)
            .map(collab => (
              <div
                key={collab.userId}
                className="absolute w-0.5 h-5 bg-blue-500 pointer-events-none"
                style={{
                  top: `${(collab.cursor!.line * 1.5) + 6}rem`,
                  left: `${(collab.cursor!.column * 0.6) + 6}rem`
                }}
              >
                <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {collab.name}
                </div>
              </div>
            ))
          }
        </div>
        
        {/* Status Bar */}
        <div className="p-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-600">
          <div>
            Last saved: {new Date(currentDocument.lastModifiedAt).toLocaleString()}
          </div>
          <div className="flex gap-4">
            <span>Words: {documentContent.split(/\s+/).filter(word => word.length > 0).length}</span>
            <span>Characters: {documentContent.length}</span>
            <span>Version: {currentDocument.versions.length}</span>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${className}`}>
      <div className="absolute inset-4 bg-white rounded-lg shadow-2xl flex overflow-hidden">
        {renderDocumentList()}
        {renderEditor()}
        
        {/* Sidebar Panels */}
        {showVersionHistory && (
          <div className="w-80 border-l border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-slate-800">Version History</h4>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {currentDocument?.versions.map(version => (
                <div key={version.id} className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Version {version.version}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(version.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 mb-2">{version.changes}</div>
                  <div className="text-xs text-slate-500">by {version.createdBy}</div>
                  <button className="mt-2 text-xs text-blue-600 hover:text-blue-800">
                    Restore this version
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {showCollaborators && (
          <div className="w-80 border-l border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-slate-800">Collaborators</h4>
              <button
                onClick={() => setShowCollaborators(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 mb-4">
              {currentDocument?.collaborators.map(collab => (
                <div key={collab.userId} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{collab.avatar}</span>
                    <div>
                      <div className="font-medium text-sm">{collab.name}</div>
                      <div className="text-xs text-slate-500 capitalize">{collab.permission}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {collab.isActive && (
                      <span className="w-2 h-2 bg-green-500 rounded-full" title="Active"></span>
                    )}
                    <select className="text-xs border border-slate-300 rounded px-2 py-1">
                      <option value="view">View</option>
                      <option value="edit">Edit</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors">
              + Invite collaborator
            </button>
          </div>
        )}
        
        {/* New Document Modal */}
        {newDocumentModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Create New Document</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={newDocumentTitle}
                    onChange={(e) => setNewDocumentTitle(e.target.value)}
                    placeholder="Enter document title..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Document Type
                  </label>
                  <select
                    value={newDocumentType}
                    onChange={(e) => setNewDocumentType(e.target.value as WorkspaceDocument["type"])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="note">Note</option>
                    <option value="proposal">Proposal</option>
                    <option value="contract">Contract</option>
                    <option value="presentation">Presentation</option>
                    <option value="spreadsheet">Spreadsheet</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Template
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {documentTemplates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-3 border rounded-lg text-left hover:bg-slate-50 transition-colors ${
                          selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : 'border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{template.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{template.name}</div>
                            <div className="text-xs text-slate-500">{template.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateDocument}
                  disabled={!newDocumentTitle.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Create Document
                </button>
                <button
                  onClick={() => {
                    setNewDocumentModal(false);
                    setNewDocumentTitle("");
                    setSelectedTemplate("");
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 z-10"
        >
          ✕
        </button>
      </div>
    </div>
  );
}