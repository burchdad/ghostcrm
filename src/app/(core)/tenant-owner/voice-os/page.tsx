'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from "@/context/SupabaseAuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import VoicePersonaManager from "@/components/voice/VoicePersonaManager";
import VoiceManager from "@/components/voice/VoiceManager";
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
  FiPhoneCall
} from 'react-icons/fi';

export default function VoiceOSPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'overview' | 'upload' | 'personas' | 'analytics' | 'wizard' | 'training' | 'languages' | 'marketplace' | 'team' | 'policies' | 'brand'>('overview');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  useRibbonPage({
    context: "settings",
    enable: ["quickActions", "export", "share"],
    disable: ["saveLayout", "aiTools", "developer", "billing"]
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Voice OS...</p>
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
      id: 'training',
      name: 'Voice Training',
      icon: FiSettings,
      description: 'Advanced voice optimization tools'
    },
    {
      id: 'languages',
      name: 'Multi-Language',
      icon: FiVolume2,
      description: 'Voice support for multiple languages'
    },
    {
      id: 'marketplace',
      name: 'Voice Marketplace',
      icon: FiShield,
      description: 'Professional voice library'
    },
    {
      id: 'team',
      name: 'Team Management',
      icon: FiUsers,
      description: 'Collaborative voice workflows'
    },
    {
      id: 'policies',
      name: 'Enterprise Policies',
      icon: FiShield,
      description: 'Voice governance and compliance'
    },
    {
      id: 'brand',
      name: 'Brand Guidelines',
      icon: FiAward,
      description: 'Voice brand consistency tools'
    },
    {
      id: 'analytics',
      name: 'Performance Analytics',
      icon: FiTrendingUp,
      description: 'Voice performance insights'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <FiZap className="w-8 h-8 mr-3" />
            <h1 className="text-3xl font-bold">Voice OS™</h1>
            <span className="ml-3 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              Revolutionary AI Voice System
            </span>
          </div>
          
          <p className="text-xl text-purple-100 mb-8 max-w-2xl">
            Upload your voice once, scale authentic conversations infinitely. 
            Your customers will think they're talking directly to you, even when they're not.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setShowWizard(true)}
              className="flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              <FiUpload className="w-5 h-5 mr-2" />
              Quick Setup Wizard
            </button>
            <button 
              onClick={() => setActiveSection('upload')}
              className="flex items-center px-6 py-3 bg-purple-500 bg-opacity-20 border border-white border-opacity-30 rounded-lg font-semibold hover:bg-opacity-30 transition-colors"
            >
              <FiMic className="w-5 h-5 mr-2" />
              Upload Voice Now
            </button>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiHeadphones className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900">Authentic Voice Cloning</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Record your voice once and our AI will learn to speak any text in your exact tone, 
            accent, and speaking style.
          </p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
              30-60 second voice samples
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
              Multiple voice personalities
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
              Real-time voice synthesis
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900">Smart Persona System</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Create different voice personalities for different situations. Owner voice for VIPs, 
            sales voice for leads, support voice for service calls.
          </p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
              Context-aware selection
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
              Automatic voice switching
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
              Performance optimization
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900">Performance Analytics</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Track which voices perform best with different customer types and call scenarios. 
            Optimize for maximum conversion and satisfaction.
          </p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
              Conversion rate tracking
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
              Customer satisfaction metrics
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
              Voice quality scoring
            </li>
          </ul>
        </div>
      </div>

      {/* Business Impact Stats */}
      <div className="bg-gray-50 rounded-xl p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Transform Your Business Communications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShield className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">+47%</h4>
            <p className="text-gray-600">Trust & Credibility</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPhoneCall className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">+31%</h4>
            <p className="text-gray-600">Call Completion Rate</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAward className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">+23%</h4>
            <p className="text-gray-600">Conversion Rate</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiActivity className="w-8 h-8 text-orange-600" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">-65%</h4>
            <p className="text-gray-600">Hangup Rate</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveSection('upload')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <FiUpload className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Upload Voice</div>
              <div className="text-sm text-gray-500">Add new recording</div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveSection('personas')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <FiUsers className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Manage Personas</div>
              <div className="text-sm text-gray-500">Voice identities</div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveSection('analytics')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <FiTrendingUp className="w-5 h-5 text-purple-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">View Analytics</div>
              <div className="text-sm text-gray-500">Performance data</div>
            </div>
          </button>
          
          <button 
            onClick={() => setShowWizard(true)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <FiSettings className="w-5 h-5 text-orange-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Setup Wizard</div>
              <div className="text-sm text-gray-500">Guided setup</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderVoiceTraining = () => (
    <div className="space-y-8">
      {/* Training Hub */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
        <div className="flex items-center mb-6">
          <FiSettings className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold">Advanced Voice Training</h2>
        </div>
        <p className="text-blue-100 mb-6">
          Transform your voice recordings into production-ready AI voices with our advanced training algorithms.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">AI Enhancement</h3>
            <p className="text-sm text-blue-100">Automatic noise reduction and clarity optimization</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Emotion Training</h3>
            <p className="text-sm text-blue-100">Expand emotional range and expressiveness</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Style Transfer</h3>
            <p className="text-sm text-blue-100">Adapt voice for different speaking styles</p>
          </div>
        </div>
      </div>

      {/* Training Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Voice Quality Optimizer</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Background Noise Removal</h4>
                <p className="text-sm text-gray-600">AI-powered noise cancellation</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Run Analysis</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Clarity Enhancement</h4>
                <p className="text-sm text-gray-600">Improve articulation and pronunciation</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Enhance</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Volume Normalization</h4>
                <p className="text-sm text-gray-600">Consistent audio levels across recordings</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Normalize</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Expression Training</h3>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-green-500 bg-green-50">
              <h4 className="font-medium text-green-900">Emotional Range Expansion</h4>
              <p className="text-sm text-green-700 mt-1">Train your AI voice to express a wider range of emotions</p>
              <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Start Training</button>
            </div>
            <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
              <h4 className="font-medium text-purple-900">Conversational Flow</h4>
              <p className="text-sm text-purple-700 mt-1">Improve natural conversation patterns and pacing</p>
              <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">Train Flow</button>
            </div>
            <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
              <h4 className="font-medium text-orange-900">Accent Refinement</h4>
              <p className="text-sm text-orange-700 mt-1">Fine-tune accent and regional speech patterns</p>
              <button className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm">Refine Accent</button>
            </div>
          </div>
        </div>
      </div>

      {/* Training History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Training History</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div>
                <h4 className="font-medium">CEO Voice - Clarity Enhancement</h4>
                <p className="text-sm text-gray-600">Completed 2 hours ago • +15% clarity improvement</p>
              </div>
            </div>
            <span className="text-green-600 font-medium">Completed</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
              <div>
                <h4 className="font-medium">Sales Voice - Emotional Range Training</h4>
                <p className="text-sm text-gray-600">In progress • 65% complete</p>
              </div>
            </div>
            <span className="text-blue-600 font-medium">Training...</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMultiLanguage = () => (
    <div className="space-y-8">
      {/* Multi-Language Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-xl p-8 text-white">
        <div className="flex items-center mb-6">
          <FiVolume2 className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold">Multi-Language Voice Support</h2>
        </div>
        <p className="text-green-100 mb-6">
          Expand your reach with AI voices that speak your customers' languages naturally.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">12+</div>
            <div className="text-sm text-green-200">Languages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">35+</div>
            <div className="text-sm text-green-200">Accents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">98%</div>
            <div className="text-sm text-green-200">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-sm text-green-200">Support</div>
          </div>
        </div>
      </div>

      {/* Language Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { lang: 'English', flag: '🇺🇸', accent: 'American, British, Australian', status: 'active' },
          { lang: 'Spanish', flag: '🇪🇸', accent: 'Spain, Mexican, Colombian', status: 'active' },
          { lang: 'French', flag: '🇫🇷', accent: 'Parisian, Canadian', status: 'active' },
          { lang: 'German', flag: '🇩🇪', accent: 'Standard, Austrian', status: 'training' },
          { lang: 'Italian', flag: '🇮🇹', accent: 'Northern, Southern', status: 'training' },
          { lang: 'Portuguese', flag: '🇧🇷', accent: 'Brazilian, European', status: 'available' }
        ].map((language, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{language.flag}</span>
                <h3 className="text-lg font-semibold">{language.lang}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                language.status === 'active' ? 'bg-green-100 text-green-800' :
                language.status === 'training' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {language.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{language.accent}</p>
            <button className={`w-full py-2 rounded-lg font-medium ${
              language.status === 'active' ? 'bg-green-600 text-white' :
              language.status === 'training' ? 'bg-blue-600 text-white' :
              'bg-gray-200 text-gray-700'
            }`}>
              {language.status === 'active' ? 'Configure' :
               language.status === 'training' ? 'View Progress' : 'Start Training'}
            </button>
          </div>
        ))}
      </div>

      {/* Language Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Language Configuration</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Auto-Detection Settings</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="rounded mr-3" defaultChecked />
                <span className="text-sm">Automatically detect customer language</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded mr-3" defaultChecked />
                <span className="text-sm">Switch voice language dynamically</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded mr-3" />
                <span className="text-sm">Fallback to English for unsupported languages</span>
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Voice Preferences</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>English (US)</option>
                  <option>Spanish (ES)</option>
                  <option>French (FR)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accent Preference</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Match customer region</option>
                  <option>Use business location</option>
                  <option>Neutral/Standard</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVoiceMarketplace = () => (
    <div className="space-y-8">
      {/* Marketplace Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-700 rounded-xl p-8 text-white">
        <div className="flex items-center mb-6">
          <FiShield className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold">Professional Voice Marketplace</h2>
        </div>
        <p className="text-purple-100 mb-6">
          Access premium professional voices when your custom voice isn't available or for specialized use cases.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold">Browse Voices</button>
          <button className="px-6 py-3 bg-purple-500 bg-opacity-20 border border-white border-opacity-30 rounded-lg font-semibold">My Purchases</button>
        </div>
      </div>

      {/* Voice Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { category: 'Executive', count: 24, icon: '👔', desc: 'Professional, authoritative voices' },
          { category: 'Sales', count: 18, icon: '📈', desc: 'Persuasive, energetic voices' },
          { category: 'Support', count: 32, icon: '🎧', desc: 'Friendly, helpful voices' },
          { category: 'Luxury', count: 12, icon: '💎', desc: 'Premium, sophisticated voices' }
        ].map((cat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{cat.category}</h3>
              <p className="text-sm text-gray-600 mb-3">{cat.desc}</p>
              <div className="text-purple-600 font-medium">{cat.count} voices</div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Voices */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Featured Professional Voices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Alexandra Executive', gender: 'Female', accent: 'American', price: '$99/month', rating: 4.9 },
            { name: 'Marcus Professional', gender: 'Male', accent: 'British', price: '$89/month', rating: 4.8 },
            { name: 'Sofia Luxury', gender: 'Female', accent: 'Spanish', price: '$119/month', rating: 4.9 }
          ].map((voice, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{voice.name}</h4>
                <div className="flex items-center text-sm text-yellow-600">
                  <span>⭐</span>
                  <span className="ml-1">{voice.rating}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <div>Gender: {voice.gender}</div>
                <div>Accent: {voice.accent}</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-purple-600">{voice.price}</span>
                <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm">Preview</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marketplace Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">150+</div>
          <div className="text-gray-600">Professional Voices</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">12</div>
          <div className="text-gray-600">Languages</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">4.8⭐</div>
          <div className="text-gray-600">Average Rating</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">24/7</div>
          <div className="text-gray-600">Voice Support</div>
        </div>
      </div>
    </div>
  );

  const renderTeamManagement = () => (
    <div className="space-y-8">
      {/* Team Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-8 text-white">
        <div className="flex items-center mb-6">
          <FiUsers className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold">Team Voice Management</h2>
        </div>
        <p className="text-indigo-100 mb-6">
          Collaborative voice workflows for your entire organization with role-based access and approval processes.
        </p>
        <button className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold">Invite Team Member</button>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Team Members</h3>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Add Member</button>
        </div>
        <div className="space-y-4">
          {[
            { name: 'Sarah Johnson', role: 'Voice Administrator', permissions: 'Full Access', voices: 3, status: 'Active' },
            { name: 'Mike Chen', role: 'Voice Editor', permissions: 'Edit & Upload', voices: 2, status: 'Active' },
            { name: 'Lisa Rodriguez', role: 'Voice Reviewer', permissions: 'Review & Approve', voices: 0, status: 'Pending' }
          ].map((member, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <span className="font-medium text-indigo-600">{member.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.role} • {member.permissions}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{member.voices} voices</div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {member.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Voice Approval Workflow</h3>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mr-3 text-blue-600 font-medium">1</div>
              <div>
                <h4 className="font-medium">Voice Upload</h4>
                <p className="text-sm text-gray-600">Team member uploads voice recording</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center mr-3 text-yellow-600 font-medium">2</div>
              <div>
                <h4 className="font-medium">Quality Review</h4>
                <p className="text-sm text-gray-600">Automated quality analysis and scoring</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center mr-3 text-purple-600 font-medium">3</div>
              <div>
                <h4 className="font-medium">Team Approval</h4>
                <p className="text-sm text-gray-600">Designated approver reviews and approves</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mr-3 text-green-600 font-medium">4</div>
              <div>
                <h4 className="font-medium">Production Ready</h4>
                <p className="text-sm text-gray-600">Voice becomes available for AI calls</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Role Permissions</h3>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Voice Administrator</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Full access to all voices</li>
                <li>• Manage team members</li>
                <li>• Configure voice policies</li>
                <li>• Override approvals</li>
              </ul>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Voice Editor</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Upload and edit voices</li>
                <li>• Access voice training tools</li>
                <li>• Submit for approval</li>
                <li>• View analytics</li>
              </ul>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Voice Reviewer</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Review pending voices</li>
                <li>• Approve/reject submissions</li>
                <li>• Add review comments</li>
                <li>• View team activity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEnterprisePolicies = () => (
    <div className="space-y-8">
      {/* Enterprise Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-700 rounded-xl p-8 text-white">
        <div className="flex items-center mb-6">
          <FiShield className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold">Enterprise Voice Policies</h2>
        </div>
        <p className="text-red-100 mb-6">
          Comprehensive governance framework ensuring compliance, security, and consistency across all voice operations.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold">Create Policy</button>
          <button className="px-6 py-3 bg-red-500 bg-opacity-20 border border-white border-opacity-30 rounded-lg font-semibold">Audit Report</button>
        </div>
      </div>

      {/* Policy Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Data Privacy', icon: '🔒', count: 8, status: 'Active' },
          { title: 'Compliance', icon: '📋', count: 12, status: 'Active' },
          { title: 'Usage Limits', icon: '⏱️', count: 5, status: 'Active' },
          { title: 'Quality Standards', icon: '⭐', count: 6, status: 'Review' },
          { title: 'Access Control', icon: '🔑', count: 9, status: 'Active' },
          { title: 'Audit Trails', icon: '📊', count: 4, status: 'Active' }
        ].map((policy, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{policy.icon}</span>
                <h3 className="text-lg font-semibold">{policy.title}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                policy.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {policy.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{policy.count} policies configured</p>
            <button className="w-full py-2 bg-red-600 text-white rounded-lg font-medium">Manage Policies</button>
          </div>
        ))}
      </div>

      {/* Active Policies */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Active Enterprise Policies</h3>
        <div className="space-y-4">
          {[
            { 
              name: 'Voice Data Retention Policy', 
              type: 'Data Privacy', 
              description: 'All voice recordings are automatically deleted after 90 days unless explicitly retained',
              compliance: 'GDPR, CCPA',
              lastUpdated: '2 days ago'
            },
            { 
              name: 'Quality Assurance Standards', 
              type: 'Quality', 
              description: 'All AI voices must maintain minimum 85% clarity score and pass brand consistency checks',
              compliance: 'Internal Standards',
              lastUpdated: '1 week ago'
            },
            { 
              name: 'Usage Monitoring & Limits', 
              type: 'Usage Control', 
              description: 'Maximum 10,000 voice calls per month with automated alerts at 80% threshold',
              compliance: 'Cost Management',
              lastUpdated: '3 days ago'
            }
          ].map((policy, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{policy.name}</h4>
                <span className="text-xs text-gray-500">{policy.lastUpdated}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{policy.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{policy.type}</span>
                  <span className="text-xs text-gray-500">Compliance: {policy.compliance}</span>
                </div>
                <button className="text-red-600 text-sm font-medium">Edit Policy</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Compliance Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium">GDPR Compliance</span>
              </div>
              <span className="text-green-600 font-medium">✓ Compliant</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium">CCPA Compliance</span>
              </div>
              <span className="text-green-600 font-medium">✓ Compliant</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="font-medium">SOX Compliance</span>
              </div>
              <span className="text-yellow-600 font-medium">⚠ Review Required</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Audit Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-sm">Voice Policy Audit Completed</h4>
                <p className="text-xs text-gray-600">All 34 policies reviewed and validated</p>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-sm">Access Control Review</h4>
                <p className="text-xs text-gray-600">User permissions audit initiated</p>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-sm">Data Retention Cleanup</h4>
                <p className="text-xs text-gray-600">Expired voice data automatically purged</p>
              </div>
              <span className="text-xs text-gray-500">3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBrandGuidelines = () => (
    <div className="space-y-8">
      {/* Brand Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-xl p-8 text-white">
        <div className="flex items-center mb-6">
          <FiAward className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold">Voice Brand Guidelines</h2>
        </div>
        <p className="text-amber-100 mb-6">
          Ensure consistent brand voice across all AI interactions with comprehensive style guides and automatic compliance checking.
        </p>
        <button className="px-6 py-3 bg-white text-amber-600 rounded-lg font-semibold">Create Brand Guide</button>
      </div>

      {/* Brand Elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Personality</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Professional</span>
              <div className="w-20 h-2 bg-gray-200 rounded-full">
                <div className="w-4/5 h-2 bg-amber-500 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Friendly</span>
              <div className="w-20 h-2 bg-gray-200 rounded-full">
                <div className="w-3/4 h-2 bg-amber-500 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Authoritative</span>
              <div className="w-20 h-2 bg-gray-200 rounded-full">
                <div className="w-2/3 h-2 bg-amber-500 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Empathetic</span>
              <div className="w-20 h-2 bg-gray-200 rounded-full">
                <div className="w-4/5 h-2 bg-amber-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Speaking Style</h3>
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 rounded-lg">
              <h4 className="font-medium text-amber-900 text-sm">Pace</h4>
              <p className="text-amber-700 text-xs">Moderate speed, clear articulation</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <h4 className="font-medium text-amber-900 text-sm">Tone</h4>
              <p className="text-amber-700 text-xs">Warm, confident, approachable</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <h4 className="font-medium text-amber-900 text-sm">Language</h4>
              <p className="text-amber-700 text-xs">Clear, concise, professional</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Compliance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="text-sm">Voice Quality</span>
              <span className="text-green-600 font-medium">98%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="text-sm">Tone Consistency</span>
              <span className="text-green-600 font-medium">95%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
              <span className="text-sm">Brand Adherence</span>
              <span className="text-yellow-600 font-medium">87%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Guidelines Editor */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Brand Voice Guidelines</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Core Brand Values</h4>
              <div className="space-y-3">
                <input type="text" placeholder="Enter brand value" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                <div className="flex flex-wrap gap-2">
                  {['Trustworthy', 'Innovative', 'Customer-Focused', 'Professional'].map((value, index) => (
                    <span key={index} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                      {value} ×
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Prohibited Phrases</h4>
              <div className="space-y-3">
                <textarea 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                  rows={3}
                  placeholder="Enter phrases to avoid..."
                ></textarea>
                <div className="text-sm text-gray-600">
                  AI voices will automatically avoid these phrases and suggest alternatives.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Preferred Terminology</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
                  <span className="text-sm">Customers → Valued Partners</span>
                  <button className="text-red-500 text-xs">Remove</button>
                </div>
                <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
                  <span className="text-sm">Problem → Challenge</span>
                  <button className="text-red-500 text-xs">Remove</button>
                </div>
                <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 text-sm">+ Add Terminology</button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Voice Training Scripts</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">Sample Script for Training:</p>
                <p className="text-sm italic">
                  "Hello, and thank you for choosing [Company Name]. I'm here to provide you with exceptional service 
                  and ensure your experience exceeds expectations. How may I assist you today?"
                </p>
                <button className="mt-3 text-amber-600 text-sm font-medium">Edit Script</button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg">Save Draft</button>
          <button className="px-6 py-2 bg-amber-600 text-white rounded-lg">Publish Guidelines</button>
        </div>
      </div>

      {/* Brand Compliance Monitor */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Brand Compliance Monitoring</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">94%</div>
            <div className="text-sm text-green-700">Overall Brand Compliance</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">1,247</div>
            <div className="text-sm text-blue-700">Calls Monitored Today</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">12</div>
            <div className="text-sm text-purple-700">Brand Violations Flagged</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      {/* Analytics Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-700 rounded-xl p-8 text-white">
        <div className="flex items-center mb-6">
          <FiTrendingUp className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold">Advanced Voice Analytics</h2>
        </div>
        <p className="text-green-100 mb-6">
          Comprehensive performance insights, conversion tracking, and AI-powered optimization recommendations.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">+23%</div>
          <div className="text-gray-600">Conversion Rate</div>
          <div className="text-xs text-gray-500 mt-1">vs. previous month</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">4.7⭐</div>
          <div className="text-gray-600">Customer Satisfaction</div>
          <div className="text-xs text-gray-500 mt-1">avg. rating</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">89%</div>
          <div className="text-gray-600">Voice Quality Score</div>
          <div className="text-xs text-gray-500 mt-1">AI-calculated</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">2.3min</div>
          <div className="text-gray-600">Avg. Call Duration</div>
          <div className="text-xs text-gray-500 mt-1">optimal range</div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Voice Performance Trends</h3>
          <div className="h-64 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Interactive performance chart would be rendered here</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Calls Initiated</span>
              <div className="flex items-center">
                <div className="w-32 h-4 bg-gray-200 rounded-full mr-3">
                  <div className="w-full h-4 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">1,247</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Calls Completed</span>
              <div className="flex items-center">
                <div className="w-32 h-4 bg-gray-200 rounded-full mr-3">
                  <div className="w-4/5 h-4 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">1,098</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Positive Responses</span>
              <div className="flex items-center">
                <div className="w-32 h-4 bg-gray-200 rounded-full mr-3">
                  <div className="w-3/5 h-4 bg-purple-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">743</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Conversions</span>
              <div className="flex items-center">
                <div className="w-32 h-4 bg-gray-200 rounded-full mr-3">
                  <div className="w-2/5 h-4 bg-orange-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">287</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Insights */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">AI-Powered Voice Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 border-l-4 border-green-500 bg-green-50">
            <h4 className="font-medium text-green-900">Optimal Performance Window</h4>
            <p className="text-sm text-green-700 mt-1">Your CEO voice performs 34% better between 10 AM - 2 PM</p>
          </div>
          <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
            <h4 className="font-medium text-blue-900">Language Preference</h4>
            <p className="text-sm text-blue-700 mt-1">Spanish-speaking customers show 28% higher satisfaction</p>
          </div>
          <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
            <h4 className="font-medium text-purple-900">Persona Optimization</h4>
            <p className="text-sm text-purple-700 mt-1">Sales persona increases conversion by 19% for warm leads</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSetupWizard = () => (
    <div className="max-w-4xl mx-auto">
      {/* Wizard Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Voice OS Setup Wizard</h2>
            <p className="text-gray-600">Get your authentic AI voice ready in 5 minutes</p>
          </div>
          <button 
            onClick={() => setShowWizard(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center mb-8">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= wizardStep 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 5 && (
                <div className={`h-1 w-16 mx-2 ${
                  step < wizardStep ? 'bg-purple-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Wizard Content */}
        {wizardStep === 1 && (
          <div className="text-center">
            <FiMic className="w-16 h-16 text-purple-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Welcome to Voice OS!</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              You're about to create the most authentic AI voice system ever built. 
              Your customers will think they're talking directly to you, building unprecedented trust.
            </p>
            <button 
              onClick={() => setWizardStep(2)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Let's Get Started
            </button>
          </div>
        )}

        {wizardStep === 2 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Step 2: Recording Preparation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-4">🎯 What You'll Need</h4>
                <ul className="space-y-2 text-blue-800">
                  <li>• Quiet room with minimal echo</li>
                  <li>• Good microphone or smartphone</li>
                  <li>• 2-3 minutes of your time</li>
                  <li>• Natural, conversational tone</li>
                </ul>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="font-semibold text-green-900 mb-4">📝 Recording Tips</h4>
                <ul className="space-y-2 text-green-800">
                  <li>• Speak naturally, not like a robot</li>
                  <li>• Include different emotions</li>
                  <li>• Vary your pace and energy</li>
                  <li>• Sound like you're helping a customer</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button 
                onClick={() => setWizardStep(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => setWizardStep(3)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                I'm Ready to Record
              </button>
            </div>
          </div>
        )}

        {/* Additional wizard steps would go here */}
      </div>
    </div>
  );

  return (
    <I18nProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {showWizard ? (
              renderSetupWizard()
            ) : (
              <>
                {/* Navigation */}
                <div className="mb-8">
                  <nav className="flex space-x-1 bg-white rounded-xl p-2 border border-gray-200">
                    {navigationItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as any)}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                          activeSection === item.id
                            ? 'bg-purple-100 text-purple-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs opacity-75">{item.description}</div>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Content */}
                <div className="space-y-8">
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
                  {activeSection === 'training' && renderVoiceTraining()}
                  {activeSection === 'languages' && renderMultiLanguage()}
                  {activeSection === 'marketplace' && renderVoiceMarketplace()}
                  {activeSection === 'team' && renderTeamManagement()}
                  {activeSection === 'policies' && renderEnterprisePolicies()}
                  {activeSection === 'brand' && renderBrandGuidelines()}
                  {activeSection === 'analytics' && renderAnalytics()}
                </div>
              </>
            )}
          </div>
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}