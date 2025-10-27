"use client";
import React, { useState, useRef, useEffect } from "react";

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  mentions: string[];
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
  reactions: { [emoji: string]: string[] }; // emoji -> user IDs
  attachments: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
  parentId?: string; // for threaded replies
  entityType: string; // lead, deal, contact, etc.
  entityId: string;
}

interface CollaborationPanelProps {
  entityType: string;
  entityId: string;
  entityTitle?: string;
  isOpen: boolean;
  onClose: () => void;
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

export default function CollaborationPanel({
  entityType,
  entityId,
  entityTitle = "Record",
  isOpen,
  onClose,
  onStartVideoCall,
  className = ""
}: CollaborationPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("comments");
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize with empty data
  useEffect(() => {
    setComments([]);
  }, [entityType, entityId]);

  const teamMembers: Array<{
    id: string;
    name: string;
    avatar: string;
    email: string;
  }> = [];

  const emojis = ["👍", "👎", "❤️", "😊", "😮", "😢", "😡", "🔥", "✅", "❌", "💡", "🎉"];

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      authorId: "current_user",
      authorName: "You",
      authorAvatar: "👤",
      content: newComment,
      mentions: extractMentions(newComment),
      timestamp: new Date().toISOString(),
      reactions: {},
      attachments: [],
      parentId: replyingTo || undefined,
      entityType,
      entityId
    };

    setComments(prev => [...prev, comment]);
    setNewComment("");
    setReplyingTo(null);
  };

  const handleEditComment = (commentId: string, newContent: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            content: newContent, 
            edited: true, 
            editedAt: new Date().toISOString(),
            mentions: extractMentions(newContent)
          }
        : comment
    ));
    setEditingComment(null);
  };

  const handleReaction = (commentId: string, emoji: string) => {
    const currentUserId = "current_user";
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        const reactions = { ...comment.reactions };
        if (reactions[emoji]) {
          if (reactions[emoji].includes(currentUserId)) {
            reactions[emoji] = reactions[emoji].filter(id => id !== currentUserId);
            if (reactions[emoji].length === 0) {
              delete reactions[emoji];
            }
          } else {
            reactions[emoji] = [...reactions[emoji], currentUserId];
          }
        } else {
          reactions[emoji] = [currentUserId];
        }
        return { ...comment, reactions };
      }
      return comment;
    }));
    setShowEmojiPicker(null);
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@([a-zA-Z0-9-_]+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): string => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    if (type.includes('text')) return '📝';
    return '📎';
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-12 border-l-2 border-slate-200 pl-4' : ''} mb-4`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm">
            {comment.authorAvatar}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">{comment.authorName}</span>
                <span className="text-xs text-slate-500">
                  {new Date(comment.timestamp).toLocaleString()}
                </span>
                {comment.edited && (
                  <span className="text-xs text-slate-400">(edited)</span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded"
                >
                  Reply
                </button>
                <button
                  onClick={() => setEditingComment(comment.id)}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowEmojiPicker(showEmojiPicker === comment.id ? null : comment.id)}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded"
                >
                  😊
                </button>
              </div>
            </div>
            
            {editingComment === comment.id ? (
              <div className="space-y-2">
                <textarea
                  defaultValue={comment.content}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleEditComment(comment.id, e.currentTarget.value);
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement;
                      handleEditComment(comment.id, textarea.value);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingComment(null)}
                    className="px-3 py-1 border border-slate-300 text-slate-700 rounded text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-700 text-sm whitespace-pre-wrap">
                {comment.content.split(/(@[a-zA-Z0-9-_]+)/g).map((part, index) => 
                  part.match(/^@[a-zA-Z0-9-_]+$/) ? (
                    <span key={index} className="bg-blue-100 text-blue-800 px-1 rounded font-medium">
                      {part}
                    </span>
                  ) : part
                )}
              </div>
            )}
            
            {/* Attachments */}
            {comment.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {comment.attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                    <span className="text-lg">{getFileIcon(attachment.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{attachment.name}</div>
                      <div className="text-xs text-slate-500">{formatFileSize(attachment.size)}</div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-xs">Download</button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Reactions */}
            {Object.keys(comment.reactions).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {Object.entries(comment.reactions).map(([emoji, userIds]) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(comment.id, emoji)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      userIds.includes("current_user") 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{emoji}</span>
                    <span>{userIds.length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Emoji Picker */}
          {showEmojiPicker === comment.id && (
            <div className="mt-2 p-2 bg-white border border-slate-200 rounded-lg shadow-lg grid grid-cols-6 gap-1">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(comment.id, emoji)}
                  className="p-1 hover:bg-slate-100 rounded text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Render replies */}
      {comments
        .filter(c => c.parentId === comment.id)
        .map(reply => renderComment(reply, true))
      }
    </div>
  );

  const renderCommentComposer = () => (
    <div className="border-t border-slate-200 p-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm">
            👤
          </div>
        </div>
        
        <div className="flex-1">
          {replyingTo && (
            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
              <span className="text-blue-800">Replying to {comments.find(c => c.id === replyingTo)?.authorName}</span>
              <button
                onClick={() => setReplyingTo(null)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ✕
              </button>
            </div>
          )}
          
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyingTo ? "Write a reply..." : `Add a comment about this ${entityType}...`}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleAddComment();
              }
            }}
          />
          
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-500 hover:text-slate-700 rounded"
                title="Attach file"
              >
                📎
              </button>
              <button
                className="p-2 text-slate-500 hover:text-slate-700 rounded"
                title="Add emoji"
              >
                😊
              </button>
              <button
                className="p-2 text-slate-500 hover:text-slate-700 rounded"
                title="Mention someone"
              >
                @
              </button>
            </div>
            
            <div className="flex gap-2">
              <span className="text-xs text-slate-500">Ctrl+Enter to send</span>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-sm"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          // Handle file uploads
          console.log('Files selected:', e.target.files);
        }}
      />
    </div>
  );

  const renderActivityTab = () => (
    <div className="p-4 space-y-4">
      <div className="text-sm text-slate-600">Recent activity on this {entityType}</div>
      
      <div className="text-center py-8 text-slate-500">
        <div className="text-4xl mb-2">📈</div>
        <div>No recent activity</div>
        <div className="text-sm">Activity will appear here when team members interact with this {entityType}</div>
      </div>
    </div>
  );

  const renderTeamTab = () => (
    <div className="p-4 space-y-4">
      <div className="text-sm text-slate-600">Team members working on this {entityType}</div>
      
      {teamMembers.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <div className="text-4xl mb-2">👥</div>
          <div>No team members assigned</div>
          <div className="text-sm">Invite team members to start collaborating</div>
        </div>
      ) : (
        teamMembers.map(member => (
          <div key={member.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm">
              {member.avatar}
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-800">{member.name}</div>
              <div className="text-sm text-slate-500">{member.email}</div>
            </div>
            <div className="flex gap-2">
              <button className="text-blue-600 hover:text-blue-800 text-sm">Message</button>
              <button className="text-green-600 hover:text-green-800 text-sm">@Mention</button>
            </div>
          </div>
        ))
      )}
      
      <button className="w-full p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors">
        + Invite team member
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed right-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 transform transition-transform ${className}`}
      style={{
        top: 'var(--unified-toolbar-h, 64px)',
        height: 'calc(100vh - var(--unified-toolbar-h, 64px))'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Collaboration</h3>
            <p className="text-sm text-slate-600">{entityTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Tabs */}
        <div className="mt-4 flex border border-slate-200 rounded-lg bg-white">
          {[
            { id: "comments", label: "Comments", icon: "💬" },
            { id: "activity", label: "Activity", icon: "📈" },
            { id: "team", label: "Team", icon: "👥" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-100 text-blue-800"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
        {activeTab === "comments" && (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {comments.filter(comment => !comment.parentId).length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-4xl mb-2">💬</div>
                  <div>No comments yet</div>
                  <div className="text-sm">Start the conversation!</div>
                </div>
              ) : (
                comments
                  .filter(comment => !comment.parentId)
                  .map(comment => renderComment(comment))
              )}
            </div>
            {renderCommentComposer()}
          </>
        )}
        
        {activeTab === "activity" && (
          <div className="flex-1 overflow-y-auto">
            {renderActivityTab()}
          </div>
        )}
        
        {activeTab === "team" && (
          <div className="flex-1 overflow-y-auto">
            {renderTeamTab()}
          </div>
        )}
      </div>
      
      {/* Typing Indicators */}
      {isTyping.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-200 text-xs text-slate-500">
          {isTyping.join(", ")} {isTyping.length === 1 ? "is" : "are"} typing...
        </div>
      )}
    </div>
  );
}