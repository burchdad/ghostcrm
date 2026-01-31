'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import VoicePersonaManager from "@/components/voice/VoicePersonaManager";
import VoiceManager from "@/components/voice/VoiceManager";
import VoiceRecorder from "@/components/voice/VoiceRecorder";
import { 
  FiMic, 
  FiUsers, 
  FiUpload, 
  FiPlay, 
  FiSettings, 
  FiTrendingUp, 
  FiZap, 
  FiShield,
  FiAward,
  FiHeadphones,
  FiActivity,
  FiVolume2,
  FiPhoneCall,
  FiX
} from 'react-icons/fi';
import './voice-os.css';

export default function VoiceOSPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'overview' | 'upload' | 'personas' | 'analytics' | 'wizard' | 'record'>('overview');
  const [showWizard, setShowWizard] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useRibbonPage({
    context: "settings",
    enable: ["quickActions", "export", "share"],
    disable: ["saveLayout", "aiTools", "developer", "billing"]
  });

  // Handle voice upload
  const handleUploadVoice = () => {
    fileInputRef.current?.click();
  };

  // Handle voice recording
  const handleRecordVoice = () => {
    setShowRecorder(true);
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('voice', audioBlob, 'recorded-voice.webm');
      formData.append('tenantId', user?.organizationId || 'default');
      formData.append('name', 'Recorded Voice');
      formData.append('type', 'primary');

      const response = await fetch('/api/voice/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Voice recorded and uploaded successfully!');
        setShowRecorder(false);
        setActiveSection('upload');
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const handleRecordingCancel = () => {
    setShowRecorder(false);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('voice', file);
      formData.append('tenantId', user?.organizationId || 'default');
      formData.append('name', 'Primary Voice');
      formData.append('type', 'primary');

      const response = await fetch('/api/voice/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Voice uploaded successfully!');
        setActiveSection('upload');
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
  };

  // Handle wizard actions
  const startWizard = () => {
    setShowWizard(true);
    setWizardStep(1);
  };

  const nextWizardStep = () => {
    if (wizardStep < 4) {
      setWizardStep(wizardStep + 1);
    } else {
      setShowWizard(false);
      setWizardStep(1);
    }
  };

  const prevWizardStep = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    }
  };

  // Handle quick actions
  const handleManagePersonas = () => {
    setActiveSection('personas');
  };

  const handleViewAnalytics = () => {
    setActiveSection('analytics');
  };

  if (isLoading) {
    return (
      <div className="voice-os-loading">
        <div className="voice-os-loading-content">
          <div className="voice-os-spinner"></div>
          <p className="voice-os-loading-text">Loading Voice OS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const navigationItems = [
    {
      id: 'overview',
      name: 'Voice OS Overview',
      icon: FiZap,
      description: 'System status and quick actions'
    },
    {
      id: 'upload',
      name: 'Voice Library', 
      icon: FiMic,
      description: 'Upload and manage voice recordings'
    },
    {
      id: 'personas',
      name: 'Persona Management',
      icon: FiUsers,
      description: 'Advanced voice identity system'
    },
    {
      id: 'analytics',
      name: 'Performance Analytics',
      icon: FiTrendingUp,
      description: 'Voice performance insights'
    }
  ];

  const renderWizardStep = () => {
    switch (wizardStep) {
      case 1:
        return (
          <div className="voice-os-wizard-content">
            <h3>Welcome to Voice OS Setup</h3>
            <p>Let's get your AI voice system configured in just a few simple steps. This wizard will guide you through uploading your voice and setting up your first voice persona.</p>
            <div className="voice-os-feature-grid">
              <div className="voice-os-feature-card voice-os-clickable-card" onClick={() => setWizardStep(2)}>
                <div className="voice-os-feature-header">
                  <div className="voice-os-feature-icon-container blue">
                    <FiMic className="voice-os-feature-icon blue" />
                  </div>
                  <h4 className="voice-os-feature-title">Voice Upload</h4>
                </div>
                <p className="voice-os-feature-description">Record a 30-60 second sample of your voice</p>
              </div>
              <div className="voice-os-feature-card voice-os-clickable-card" onClick={() => setWizardStep(3)}>
                <div className="voice-os-feature-header">
                  <div className="voice-os-feature-icon-container green">
                    <FiUsers className="voice-os-feature-icon green" />
                  </div>
                  <h4 className="voice-os-feature-title">Persona Setup</h4>
                </div>
                <p className="voice-os-feature-description">Configure voice personalities for different scenarios</p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="voice-os-wizard-content">
            <h3>Upload Your Voice Sample</h3>
            <p>Upload a clear recording of your voice. The better the quality, the more authentic your AI voice will sound.</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={handleRecordVoice} className="voice-os-btn-primary">
                <FiMic className="voice-os-btn-icon" />
                Record Voice
              </button>
              <button onClick={handleUploadVoice} className="voice-os-btn-outline">
                <FiUpload className="voice-os-btn-icon" />
                Upload File
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        );
      case 3:
        return (
          <div className="voice-os-wizard-content">
            <h3>Configure Voice Settings</h3>
            <p>Set up how your AI voice should behave in different scenarios.</p>
            <div className="voice-os-section">
              <label>Voice Name:</label>
              <input type="text" placeholder="My Primary Voice" style={{ width: '100%', padding: '8px', marginTop: '8px', border: '1px solid #e5e7eb', borderRadius: '4px' }} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="voice-os-wizard-content">
            <h3>Setup Complete!</h3>
            <p>Your Voice OS system is ready to use. You can now make AI calls using your custom voice.</p>
            <div className="voice-os-feature-card">
              <div className="voice-os-feature-header">
                <div className="voice-os-feature-icon-container green">
                  <FiZap className="voice-os-feature-icon green" />
                </div>
                <h4 className="voice-os-feature-title">System Ready</h4>
              </div>
              <p className="voice-os-feature-description">Your AI voice is now available for use in calls and messages</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderOverview = () => (
    <div>
      {/* Hero Section */}
      <div className="voice-os-hero">
        <div className="voice-os-hero-bg-circle-1"></div>
        <div className="voice-os-hero-bg-circle-2"></div>
        
        <div className="voice-os-hero-content">
          <div className="voice-os-hero-header">
            <FiZap className="voice-os-hero-icon" />
            <h1 className="voice-os-hero-title">Voice OS™</h1>
            <span className="voice-os-hero-badge">
              Revolutionary AI Voice System
            </span>
          </div>
          
          <p className="voice-os-hero-subtitle">
            Upload your voice once, scale authentic conversations infinitely. 
            Your customers will think they're talking directly to you, even when they're not.
          </p>
          
          <div className="voice-os-hero-actions">
            <button 
              onClick={startWizard}
              className="voice-os-btn-primary"
            >
              <FiUpload className="voice-os-btn-icon" />
              Quick Setup Wizard
            </button>
            <button 
              onClick={handleRecordVoice}
              className="voice-os-btn-secondary"
            >
              <FiMic className="voice-os-btn-icon" />
              Record Voice Now
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="voice-os-metrics-section">
        <div className="voice-os-metrics-header">
          <h2 className="voice-os-metrics-title">Transform Your Business Communications</h2>
          <p className="voice-os-metrics-subtitle">See the impact of authentic AI voice technology</p>
        </div>
        
        <div className="voice-os-metrics-grid">
          <div className="voice-os-metric-card">
            <div className="voice-os-metric-icon-container blue">
              <FiShield className="voice-os-metric-icon blue" />
            </div>
            <div className="voice-os-metric-value positive">+47%</div>
            <div className="voice-os-metric-label">Trust & Credibility</div>
          </div>
          
          <div className="voice-os-metric-card">
            <div className="voice-os-metric-icon-container green">
              <FiPhoneCall className="voice-os-metric-icon green" />
            </div>
            <div className="voice-os-metric-value positive">+31%</div>
            <div className="voice-os-metric-label">Call Completion Rate</div>
          </div>
          
          <div className="voice-os-metric-card">
            <div className="voice-os-metric-icon-container purple">
              <FiAward className="voice-os-metric-icon purple" />
            </div>
            <div className="voice-os-metric-value positive">+23%</div>
            <div className="voice-os-metric-label">Conversion Rate</div>
          </div>
          
          <div className="voice-os-metric-card">
            <div className="voice-os-metric-icon-container red">
              <FiActivity className="voice-os-metric-icon red" />
            </div>
            <div className="voice-os-metric-value negative">-65%</div>
            <div className="voice-os-metric-label">Hangup Rate</div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="voice-os-feature-grid">
        <div className="voice-os-feature-card">
          <div className="voice-os-feature-header">
            <div className="voice-os-feature-icon-container blue">
              <FiHeadphones className="voice-os-feature-icon blue" />
            </div>
            <h3 className="voice-os-feature-title">Authentic Voice Cloning</h3>
          </div>
          <p className="voice-os-feature-description">
            Record your voice once and our AI will learn to speak any text in your exact tone, 
            accent, and speaking style.
          </p>
          <ul className="voice-os-feature-list">
            <li className="voice-os-feature-list-item">
              <div className="voice-os-feature-bullet blue"></div>
              30-60 second voice samples
            </li>
            <li className="voice-os-feature-list-item">
              <div className="voice-os-feature-bullet blue"></div>
              Multiple voice personalities
            </li>
            <li className="voice-os-feature-list-item">
              <div className="voice-os-feature-bullet blue"></div>
              Real-time voice synthesis
            </li>
          </ul>
        </div>

        <div className="voice-os-feature-card">
          <div className="voice-os-feature-header">
            <div className="voice-os-feature-icon-container green">
              <FiUsers className="voice-os-feature-icon green" />
            </div>
            <h3 className="voice-os-feature-title">Smart Persona System</h3>
          </div>
          <p className="voice-os-feature-description">
            Create different voice personalities for different situations. Owner voice for VIPs, 
            sales voice for leads, support voice for service calls.
          </p>
          <ul className="voice-os-feature-list">
            <li className="voice-os-feature-list-item">
              <div className="voice-os-feature-bullet green"></div>
              Context-aware selection
            </li>
            <li className="voice-os-feature-list-item">
              <div className="voice-os-feature-bullet green"></div>
              Automatic voice switching
            </li>
            <li className="voice-os-feature-list-item">
              <div className="voice-os-feature-bullet green"></div>
              Performance optimization
            </li>
          </ul>
        </div>

        <div className="voice-os-feature-card">
          <div className="voice-os-feature-header">
            <div className="voice-os-feature-icon-container purple">
              <FiTrendingUp className="voice-os-feature-icon purple" />
            </div>
            <h3 className="voice-os-feature-title">Performance Analytics</h3>
          </div>
          <p className="voice-os-feature-description">
            Track which voices perform best with different customer types and call scenarios. 
            Optimize for maximum conversion and satisfaction.
          </p>
          <ul className="voice-os-feature-list">
            <li className="voice-os-feature-list-item">
              <div className="voice-os-feature-bullet purple"></div>
              Conversion rate tracking
            </li>
            <li className="voice-os-feature-list-item">
              <div className="voice-os-feature-bullet purple"></div>
              Customer satisfaction metrics
            </li>
            <li className="voice-os-feature-list-item">
              <div className="voice-os-feature-bullet purple"></div>
              Voice quality scoring
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="voice-os-quick-actions">
        <h2 className="voice-os-quick-actions-title">Quick Actions</h2>
        <div className="voice-os-quick-actions-grid">
          <button 
            onClick={handleRecordVoice}
            className="voice-os-quick-action"
          >
            <FiMic className="voice-os-quick-action-icon blue" />
            <div className="voice-os-quick-action-content">
              <div className="voice-os-quick-action-title">Record Voice</div>
              <div className="voice-os-quick-action-desc">Record with microphone</div>
            </div>
          </button>
          
          <button 
            onClick={handleUploadVoice}
            className="voice-os-quick-action"
          >
            <FiUpload className="voice-os-quick-action-icon blue" />
            <div className="voice-os-quick-action-content">
              <div className="voice-os-quick-action-title">Upload Voice</div>
              <div className="voice-os-quick-action-desc">Upload audio file</div>
            </div>
          </button>
          
          <button 
            onClick={handleManagePersonas}
            className="voice-os-quick-action"
          >
            <FiUsers className="voice-os-quick-action-icon green" />
            <div className="voice-os-quick-action-content">
              <div className="voice-os-quick-action-title">Manage Personas</div>
              <div className="voice-os-quick-action-desc">Voice identities</div>
            </div>
          </button>
          
          <button 
            onClick={handleViewAnalytics}
            className="voice-os-quick-action"
          >
            <FiTrendingUp className="voice-os-quick-action-icon purple" />
            <div className="voice-os-quick-action-content">
              <div className="voice-os-quick-action-title">View Analytics</div>
              <div className="voice-os-quick-action-desc">Performance data</div>
            </div>
          </button>
          
          <button 
            onClick={startWizard}
            className="voice-os-quick-action"
          >
            <FiSettings className="voice-os-quick-action-icon orange" />
            <div className="voice-os-quick-action-content">
              <div className="voice-os-quick-action-title">Setup Wizard</div>
              <div className="voice-os-quick-action-desc">Guided setup</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <I18nProvider>
      <ToastProvider>
        <div className="voice-os-container">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {showRecorder ? (
              <div className="voice-os-modal-overlay">
                <div className="voice-os-modal">
                  <div className="voice-os-modal-header">
                    <h2 className="voice-os-modal-title">Record Your Voice</h2>
                    <button 
                      onClick={handleRecordingCancel}
                      className="voice-os-modal-close"
                    >
                      <FiX className="voice-os-modal-close-icon" />
                    </button>
                  </div>
                  <VoiceRecorder
                    onRecordingComplete={handleRecordingComplete}
                    onCancel={handleRecordingCancel}
                    maxDuration={60}
                  />
                </div>
              </div>
            ) : showWizard ? (
              <div className="voice-os-modal-overlay">
                <div className="voice-os-modal">
                  <div className="voice-os-modal-header">
                    <h2 className="voice-os-modal-title">Voice OS Setup Wizard</h2>
                    <button 
                      onClick={() => setShowWizard(false)}
                      className="voice-os-modal-close"
                    >
                      <FiX className="voice-os-modal-close-icon" />
                    </button>
                  </div>
                  
                  {/* Wizard Progress */}
                  <div className="voice-os-wizard-progress">
                    {[1, 2, 3, 4].map((step) => (
                      <div 
                        key={step}
                        className={`voice-os-wizard-step ${step < wizardStep ? 'completed' : step === wizardStep ? 'active' : 'pending'}`}
                      >
                        <div className={`voice-os-wizard-step-circle ${step < wizardStep ? 'completed' : step === wizardStep ? 'active' : 'pending'}`}>
                          {step}
                        </div>
                        <span className="voice-os-wizard-step-label">
                          {step === 1 && 'Welcome'}
                          {step === 2 && 'Upload'}
                          {step === 3 && 'Configure'}
                          {step === 4 && 'Complete'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {renderWizardStep()}

                  <div className="voice-os-wizard-actions">
                    <button 
                      onClick={prevWizardStep}
                      disabled={wizardStep === 1}
                      className="voice-os-btn-outline"
                    >
                      Previous
                    </button>
                    <button 
                      onClick={nextWizardStep}
                      className="voice-os-btn-primary"
                    >
                      {wizardStep === 4 ? 'Finish' : 'Next'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Navigation */}
                <div className="voice-os-navigation">
                  <nav className="voice-os-nav-container">
                    {navigationItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as any)}
                        className={`voice-os-nav-item ${activeSection === item.id ? 'active' : ''}`}
                      >
                        <item.icon className="voice-os-nav-item-icon" />
                        <div className="voice-os-nav-item-content">
                          <span className="voice-os-nav-item-title">{item.name}</span>
                          <span className="voice-os-nav-item-desc">{item.description}</span>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Content */}
                <div>
                  {activeSection === 'overview' && renderOverview()}
                  {activeSection === 'upload' && (
                    <VoiceManager 
                      tenantId={user?.organizationId || 'default'} 
                      onVoiceUpdate={(voices) => console.log('Voice library updated:', voices)}
                    />
                  )}
                  {activeSection === 'personas' && (
                    <VoicePersonaManager 
                      tenantId={user?.organizationId || 'default'}
                      onPersonaUpdate={(personas) => console.log('Voice personas updated:', personas)}
                    />
                  )}
                  {activeSection === 'analytics' && (
                    <div className="voice-os-section">
                      <div className="voice-os-section-header">
                        <h2 className="voice-os-section-title">Voice Analytics</h2>
                        <p className="voice-os-section-subtitle">Performance insights and voice quality metrics</p>
                      </div>
                      <p>Analytics dashboard will be populated with real usage data.</p>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* Hidden file input for voice uploads */}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}