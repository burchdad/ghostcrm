"use client";
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { MessageSquare, Bot, BarChart3, RefreshCw, Send, Smartphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import './AISMSModal.css';

interface Lead {
  "Full Name": string;
  "Phone Number": string;
  "Stage"?: string;
  "Vehicle Interest"?: string;
  "Budget Range"?: string;
}

interface AISMSModalProps {
  open: boolean;
  onClose: () => void;
  smsLead: Lead | null;
  smsSending: boolean;
  handleSmsAction: () => void;
}

export function AISMSModal({
  open,
  onClose,
  smsLead,
  smsSending,
  handleSmsAction
}: AISMSModalProps) {
  const [smsMessage, setSmsMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageType, setMessageType] = useState("followup");
  const [tone, setTone] = useState("professional");

  // Generate AI SMS message using API
  const generateAISmsMessage = async (lead: Lead | null, type = "followup", toneStyle = "professional") => {
    if (!lead) return "";
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-sms-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          leadData: lead,
          messageType: type,
          tone: toneStyle
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate SMS message');
      }

      const data = await response.json();
      return data.message;
      
    } catch (error) {
      console.error('Error generating AI SMS:', error);
      
      // Fallback to basic template if API fails
      const leadName = lead["Full Name"] || "there";
      const vehicleInterest = lead["Vehicle Interest"] || "vehicle";
      return `Hi ${leadName}! Thanks for your interest in ${vehicleInterest}. When's a good time to chat?`;
      
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate initial message when lead changes or modal opens
  useEffect(() => {
    if (open && smsLead) {
      setIsGenerating(true);
      generateAISmsMessage(smsLead, messageType, tone)
        .then(message => {
          setSmsMessage(message);
        })
        .catch(error => {
          console.error('Failed to generate initial message:', error);
        })
        .finally(() => {
          setIsGenerating(false);
        });
    }
  }, [open, smsLead]);

  const regenerateMessage = async () => {
    if (smsLead) {
      setIsGenerating(true);
      try {
        const newMessage = await generateAISmsMessage(smsLead, messageType, tone);
        setSmsMessage(newMessage);
      } catch (error) {
        console.error('Failed to regenerate message:', error);
      } finally {
        setIsGenerating(false);
      }
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`AI SMS Message - ${smsLead?.["Full Name"] || "Lead"}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* AI Assistant Header */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="p-2 bg-purple-100 rounded-full">
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-purple-900">AI SMS Assistant</h4>
            <p className="text-sm text-purple-700">Personalized message based on lead profile and sales stage</p>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - Lead Information */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Lead Information
              </h5>
              {smsLead && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-sm font-medium text-gray-600">Name:</span>
                    <span className="text-sm font-semibold text-gray-900">{smsLead["Full Name"]}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-sm font-medium text-gray-600">Phone:</span>
                    <span className="text-sm font-mono text-purple-600">{smsLead["Phone Number"]}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-sm font-medium text-gray-600">Stage:</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                      {smsLead["Stage"] || "new"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">Interest:</span>
                    <span className="text-sm text-gray-900">{smsLead["Vehicle Interest"] || "Not specified"}</span>
                  </div>
                  {smsLead["Budget Range"] && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">Budget:</span>
                      <span className="text-sm font-semibold text-green-600">{smsLead["Budget Range"]}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SMS Best Practices */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h6 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-blue-800 text-xs">📱</span>
                </div>
                SMS Best Practices
              </h6>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Keep messages under 160 characters</li>
                <li>• Include your business name</li>
                <li>• Be direct and actionable</li>
                <li>• Respect opt-out requests</li>
              </ul>
            </div>
          </div>

          {/* Right Column - SMS Message */}
          <div className="space-y-4">
            
            {/* Message Type and Tone Controls */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h6 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-400 rounded-full flex items-center justify-center">
                  <span className="text-purple-800 text-xs">⚙️</span>
                </div>
                AI Configuration
              </h6>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="message-type" className="text-sm font-medium text-gray-600">Message Type</Label>
                  <select
                    id="message-type"
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="followup">Follow-up</option>
                    <option value="appointment">Appointment</option>
                    <option value="price_quote">Price Quote</option>
                    <option value="financing">Financing</option>
                    <option value="promotion">Promotion</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="tone" className="text-sm font-medium text-gray-600">Tone</Label>
                  <select
                    id="tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="urgent">Urgent</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="sms-message" className="flex items-center gap-2 text-base font-semibold text-gray-800">
                  <Bot className="w-5 h-5 text-purple-500" />
                  AI-Generated SMS Message
                </Label>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  smsMessage.length > 160 
                    ? 'bg-red-100 text-red-600' 
                    : smsMessage.length > 140 
                    ? 'bg-yellow-100 text-yellow-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {smsMessage.length}/160
                </span>
              </div>
              <Textarea
                id="sms-message"
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="AI message will appear here..."
                rows={6}
                maxLength={320}
                className="text-sm leading-relaxed border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                disabled={isGenerating}
              />
              {smsMessage.length > 160 && (
                <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs text-orange-700">
                    <span className="font-semibold">⚠️ Long Message:</span> This will be sent as multiple SMS messages. 
                    Consider shortening for single message delivery.
                  </p>
                </div>
              )}
            </div>

            {/* Message Preview */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h6 className="font-semibold text-gray-700 mb-2">Message Preview:</h6>
              <div className="bg-white p-3 rounded-lg border shadow-sm">
                <div className="text-xs text-gray-500 mb-2">From: Ghost Auto CRM</div>
                <div className="text-sm text-gray-900">{smsMessage || "Your message will appear here..."}</div>
              </div>
            </div>

            {/* SMS Analytics */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h6 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                <div className="p-1 bg-purple-100 rounded">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                SMS Analytics
              </h6>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Response Rate */}
                <div className="bg-white p-3 rounded-lg border border-purple-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">Response Rate</span>
                    <span className="text-xs text-green-600 font-bold">↑ 8%</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">34%</div>
                  <div className="text-xs text-gray-500">This week</div>
                </div>

                {/* Delivery Rate */}
                <div className="bg-white p-3 rounded-lg border border-purple-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">Delivered</span>
                    <span className="text-xs text-blue-600 font-bold">→ 0%</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">97.2%</div>
                  <div className="text-xs text-gray-500">Success rate</div>
                </div>
              </div>

              {/* SMS Stats */}
              <div className="space-y-2">
                <h6 className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Today's Stats</h6>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-2 rounded border border-purple-100 text-center">
                    <div className="text-sm font-bold text-gray-900">12</div>
                    <div className="text-xs text-gray-600">Sent</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-purple-100 text-center">
                    <div className="text-sm font-bold text-green-600">4</div>
                    <div className="text-xs text-gray-600">Replies</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-purple-100 text-center">
                    <div className="text-sm font-bold text-purple-600">1</div>
                    <div className="text-xs text-gray-600">Meetings</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Regenerate Button */}
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={regenerateMessage}
                disabled={isGenerating}
                className="flex items-center gap-2 border-purple-300 text-purple-600 hover:bg-purple-50 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Regenerate Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Message can be edited before sending
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSmsAction}
              disabled={smsSending || !smsMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700 px-6"
            >
              {smsSending ? (
                <>
                  <MessageSquare className="w-4 h-4 mr-2 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send SMS
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}