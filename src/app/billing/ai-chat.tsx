'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Send, MessageCircle, Bot, User } from 'lucide-react'
import './ai-chat.css'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface AIChatAssistantProps {
  isOpen: boolean
  onClose: () => void
}

// Pre-defined responses for common questions
const AI_RESPONSES: Record<string, string> = {
  'pricing': `Our pricing is designed to scale with your dealership:

**Starter Plan**: $299/month + $799 setup
- Perfect for small dealerships (up to 5 users)
- Up to 500 vehicles in inventory
- Core CRM features and basic automation

**Professional Plan**: $599/month + $799 setup (Most Popular)
- For growing dealerships (up to 25 users)
- Up to 2,000 vehicles in inventory
- Advanced AI insights and automation workflows

**Enterprise Plan**: $999/month + $799 setup
- For large dealership groups (unlimited users)
- Unlimited vehicles in inventory
- Advanced AI, custom integrations, dedicated support

All plans include white-glove setup and dedicated support. Would you like details about any specific plan?`,

  'features': `GhostCRM offers comprehensive dealership management features:

**Core Features:**
- Lead management and tracking
- Customer relationship management
- Inventory management
- Sales pipeline automation
- Email & SMS campaigns
- Mobile app access

**Advanced Features:**
- AI-powered insights and recommendations
- Custom reporting and dashboards
- Advanced automation workflows
- Multi-location management
- API access for custom integrations

**Integrations:**
- DMS systems (200+ supported)
- F&I providers and lenders
- Marketing platforms
- Accounting software
- Phone systems

Would you like me to explain any specific feature in detail?`,

  'setup': `Our setup process is designed to get you operational quickly:

**Setup Timeline:**
- Starter: 2-3 business days
- Professional: 3-5 business days  
- Enterprise: 5-7 business days

**What's Included:**
- Data migration from your current system
- Staff training and onboarding
- Custom configuration for your workflows
- Integration setup with existing tools
- Quality assurance testing

**White-Glove Service:**
Our dedicated onboarding team handles everything so you can focus on running your dealership. We guarantee you'll be fully operational within the promised timeframe.

Do you have questions about migrating from a specific system?`,

  'support': `We provide comprehensive support at every level:

**All Plans Include:**
- Email support during business hours
- Online knowledge base and documentation
- Video training library
- Setup and onboarding assistance

**Professional & Enterprise:**
- Priority support with faster response times
- Phone support during business hours
- Advanced training sessions

**Enterprise Only:**
- Dedicated account manager
- 24/7 phone support
- Custom training and onboarding
- Direct escalation path

Our average response time is under 2 hours for priority support and under 24 hours for standard support.

What type of support question can I help with?`,

  'roi': `Our customers typically see significant ROI within the first year:

**Average Results:**
- 40%+ increase in lead conversion
- 25% reduction in sales cycle time
- 60% improvement in customer satisfaction
- 20+ hours saved per week on manual tasks

**Starter Plan ROI:** Typically 3x return in first year
**Professional Plan ROI:** Typically 5x return in first year  
**Enterprise Plan ROI:** Typically 7x return in first year

**How We Deliver ROI:**
- Automated lead nurturing increases conversions
- AI insights help prioritize best opportunities
- Streamlined workflows reduce manual work
- Better customer tracking improves retention

Would you like to see a customized ROI projection for your dealership?`,

  'security': `Security and compliance are top priorities:

**Enterprise Security:**
- 256-bit SSL encryption for all data
- SOC 2 Type II certified infrastructure
- Regular security audits and penetration testing
- Multi-factor authentication
- Role-based access controls

**Data Protection:**
- Encrypted data at rest and in transit
- Regular automated backups
- 99.9% uptime SLA
- GDPR and CCPA compliance ready
- Data residency controls

**Compliance:**
- Automotive industry standards
- Financial data protection
- Customer privacy regulations
- Regular compliance assessments

We take security seriously and maintain enterprise-grade protection for all customer data.

Do you have specific security or compliance requirements?`
}

export default function AIChatAssistant({ isOpen, onClose }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your GhostCRM assistant. I can help answer questions about our features, pricing, setup process, and more. What would you like to know?',
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Check for keywords and return appropriate response
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pricing')) {
      return AI_RESPONSES.pricing
    } else if (lowerMessage.includes('feature') || lowerMessage.includes('functionality') || lowerMessage.includes('what does')) {
      return AI_RESPONSES.features
    } else if (lowerMessage.includes('setup') || lowerMessage.includes('installation') || lowerMessage.includes('getting started')) {
      return AI_RESPONSES.setup
    } else if (lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('assistance')) {
      return AI_RESPONSES.support
    } else if (lowerMessage.includes('roi') || lowerMessage.includes('return') || lowerMessage.includes('results')) {
      return AI_RESPONSES.roi
    } else if (lowerMessage.includes('security') || lowerMessage.includes('safe') || lowerMessage.includes('compliance')) {
      return AI_RESPONSES.security
    } else {
      return `I'd be happy to help! I can provide information about:

• **Pricing** - Plans, costs, and billing options
• **Features** - CRM capabilities and integrations  
• **Setup** - Implementation process and timeline
• **Support** - Training and ongoing assistance
• **ROI** - Expected returns and business benefits
• **Security** - Data protection and compliance

You can also ask specific questions like:
- "What's included in the Professional plan?"
- "How long does setup take?"
- "What integrations do you support?"
- "Is my data secure?"

What would you like to learn more about?`
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputText),
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="ai-chat-overlay">
      <div className="ai-chat-container">
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-title">
            <Bot className="w-6 h-6 text-purple-400" />
            <div>
              <h3>GhostCRM Assistant</h3>
              <p>Ask me about features, pricing, or setup</p>
            </div>
          </div>
          <button onClick={onClose} className="ai-chat-close">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="ai-chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`ai-chat-message ${message.sender}`}>
              <div className="message-avatar">
                {message.sender === 'ai' ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.text.split('\n').map((line, index) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <strong key={index}>{line.slice(2, -2)}</strong>
                    }
                    if (line.startsWith('•')) {
                      return <li key={index} style={{marginLeft: '1rem'}}>{line.slice(1).trim()}</li>
                    }
                    return <div key={index}>{line}</div>
                  })}
                </div>
                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="ai-chat-message ai">
              <div className="message-avatar">
                <Bot className="w-4 h-4" />
              </div>
              <div className="message-content">
                <div className="ai-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="ai-chat-input">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about features, pricing, setup..."
            className="chat-textarea"
            rows={1}
            style={{ resize: 'none' }}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="chat-send-button"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}