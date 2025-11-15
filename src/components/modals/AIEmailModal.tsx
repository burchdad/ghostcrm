"use client";
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Mail, Bot, RefreshCw, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import './AIEmailModal.css';

interface Lead {
  "Full Name": string;
  "Email": string;
  "Stage"?: string;
  "Vehicle Interest"?: string;
  "Budget Range"?: string;
}

interface AIEmailModalProps {
  open: boolean;
  onClose: () => void;
  emailLead: Lead | null;
  emailSending: boolean;
  handleEmailSend: (emailContent: string, emailSubject?: string) => void;
}

const emailTypes = ["marketing", "followup", "appointment", "thankyou", "information", "promotion", "reminder"];
const toneOptions = ["professional", "friendly", "urgent", "casual"];

export function AIEmailModal({
  open,
  onClose,
  emailLead,
  emailSending,
  handleEmailSend
}: AIEmailModalProps) {
  const [emailType, setEmailType] = useState(emailTypes[0]);
  const [tone, setTone] = useState(toneOptions[0]);
  const [emailMessage, setEmailMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate AI email message using API
  const generateAIEmailMessage = async (lead: Lead | null, type = "followup", toneStyle = "professional") => {
    if (!lead) return "";
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-email-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          leadData: {
            first_name: lead["Full Name"]?.split(' ')[0] || '',
            last_name: lead["Full Name"]?.split(' ').slice(1).join(' ') || '',
            email: lead["Email Address"] || lead["Email"] || lead["email"],
            stage: lead["Stage"],
            vehicle_interest: lead["Vehicle Interest"],
            budget_range: lead["Budget Range"]
          },
          emailType: type,
          tone: toneStyle
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate email message');
      }

      const data = await response.json();
      return data.emailContent;
    } catch (error) {
      console.error('Failed to generate email message:', error);
      return "Unable to generate AI message. Please write your email manually.";
    } finally {
      setIsGenerating(false);
    }
  };

  // Removed getDefaultEmailMessage function - now using AI API

  // Generate initial message when lead changes or modal opens
  

  // Generate initial message when lead changes or modal opens
  useEffect(() => {
    if (open && emailLead) {
      console.log('📧 AIEmailModal - Lead data received:', emailLead);
      console.log('📧 Available email fields:', {
        'Email Address': emailLead["Email Address"],
        'Email': emailLead["Email"],
        'email': emailLead["email"]
      });
      
      setIsGenerating(true);
      generateAIEmailMessage(emailLead, emailType, tone).then(message => {
        setEmailMessage(message);
      });
    }
  }, [open, emailLead]);

  const regenerateMessage = async () => {
    if (emailLead) {
      setIsGenerating(true);
      try {
        const newMessage = await generateAIEmailMessage(emailLead, emailType, tone);
        setEmailMessage(newMessage);
      } catch (error) {
        console.error('Failed to regenerate message:', error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleEmailTypeChange = async (newType: string) => {
    console.log('Email type change triggered:', newType);
    setEmailType(newType);
    if (emailLead) {
      setIsGenerating(true);
      try {
        const newMessage = await generateAIEmailMessage(emailLead, newType, tone);
        setEmailMessage(newMessage);
      } catch (error) {
        console.error('Failed to generate message for new type:', error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleToneChange = async (newTone: string) => {
    console.log('Tone change triggered:', newTone);
    setTone(newTone);
    if (emailLead) {
      setIsGenerating(true);
      try {
        const newMessage = await generateAIEmailMessage(emailLead, emailType, newTone);
        setEmailMessage(newMessage);
      } catch (error) {
        console.error('Failed to generate message for new tone:', error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`AI Email Message - ${emailLead?.["Full Name"] || "Lead"}`}
      size="ultra"
    >
      <div className="ai-email-modal">
        {/* AI Assistant Header */}
        <div className="email-header">
          <div className="email-header-icon">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div className="email-header-content">
            <h4>AI Email Assistant</h4>
            <p>Professional email templates customized for your lead's stage and interests</p>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="email-layout">
          
          {/* Left Column - Lead Information and Email Type */}
          <div className="email-column">
            <div className="email-lead-info">
              <h5 className="email-lead-header">
                <div className="email-lead-dot"></div>
                Lead Information
              </h5>
              {emailLead && (
                <div className="email-lead-grid">
                  <div className="email-lead-row">
                    <span className="email-lead-label">Name:</span>
                    <span className="email-lead-value">{emailLead["Full Name"]}</span>
                  </div>
                  <div className="email-lead-row">
                    <span className="email-lead-label">Email:</span>
                    <span className="email-lead-value email">{emailLead["Email Address"] || emailLead["Email"] || emailLead["email"]}</span>
                  </div>
                  <div className="email-lead-row">
                    <span className="email-lead-label">Stage:</span>
                    <span className="email-lead-value badge">
                      {emailLead["Stage"] || "new"}
                    </span>
                  </div>
                  {emailLead["Vehicle Interest"] && (
                    <div className="email-lead-row">
                      <span className="email-lead-label">Interest:</span>
                      <span className="email-lead-value">{emailLead["Vehicle Interest"]}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Email Type Selection */}
            <div className="email-type-card">
              <Label htmlFor="email-type" className="email-type-header">
                <div className="email-type-icon"></div>
                Email Type
              </Label>
              <select 
                value={emailType} 
                onChange={(e) => handleEmailTypeChange(e.target.value)}
                className="email-type-select native-select"
              >
                {emailTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone Selection */}
            <div className="email-type-card">
              <Label htmlFor="email-tone" className="email-type-header">
                <div className="email-type-icon">🎭</div>
                Message Tone
              </Label>
              <select 
                value={tone} 
                onChange={(e) => handleToneChange(e.target.value)}
                className="email-type-select native-select"
              >
                {toneOptions.map(toneOption => (
                  <option key={toneOption} value={toneOption}>
                    {toneOption.charAt(0).toUpperCase() + toneOption.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Best Practices */}
            <div className="email-guidelines">
              <h6 className="email-guidelines-header">
                <div className="email-guidelines-icon">✓</div>
                Email Best Practices
              </h6>
              <ul className="email-guidelines-list">
                <li>• Use clear, compelling subject lines</li>
                <li>• Personalize with lead's name and interests</li>
                <li>• Include clear call-to-action</li>
                <li>• Keep emails professional yet friendly</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Email Message */}
          <div className="email-column">
            <div className="email-editor-section">
              <div className="email-editor-header">
                <Label htmlFor="email-message" className="email-editor-label">
                  <Bot className="w-5 h-5 text-blue-500" />
                  AI-Generated Email Message
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={regenerateMessage}
                  disabled={isGenerating}
                  className="email-regenerate-button"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3" />
                      Regenerate
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="email-message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder={isGenerating ? "Generating AI email message..." : "AI message will appear here..."}
                rows={16}
                className="email-textarea"
                disabled={isGenerating}
              />
              <div className="email-character-count">
                Characters: {emailMessage.length} | Words: {emailMessage.split(/\s+/).filter(word => word.length > 0).length}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="email-action-bar">
          <div className="email-action-info">
            Email will be sent from your CRM account
          </div>
          <div className="email-action-buttons">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="email-cancel-button"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleEmailSend(emailMessage, `Email from ${emailLead?.["Full Name"] || 'Ghost Auto CRM'}`)}
              disabled={emailSending || !emailMessage.trim()}
              className={`email-send-button ${emailSending || !emailMessage.trim() ? 'disabled' : 'enabled'}`}
            >
              {emailSending ? (
                <>
                  <Mail className="w-4 h-4 pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}