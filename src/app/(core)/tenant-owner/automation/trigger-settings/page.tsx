"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Settings,
  Save,
  Plus,
  Clock,
  Mail,
  User,
  Database,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import './trigger-settings.css';

interface Trigger {
  id: string;
  name: string;
  description: string;
  type: 'event' | 'schedule' | 'condition';
  enabled: boolean;
  config: any;
}

export default function TriggerSettingsPage() {
  const [triggers, setTriggers] = useState<Trigger[]>([
    {
      id: '1',
      name: 'New Lead Created',
      description: 'Triggers when a new lead is added to the system',
      type: 'event',
      enabled: true,
      config: { source: 'all' }
    },
    {
      id: '2',
      name: 'Email Opened',
      description: 'Triggers when a lead opens an email',
      type: 'event',
      enabled: true,
      config: { campaigns: 'all' }
    },
    {
      id: '3',
      name: 'Daily Report',
      description: 'Triggers every day at 9 AM',
      type: 'schedule',
      enabled: false,
      config: { time: '09:00', frequency: 'daily' }
    }
  ]);

  const toggleTrigger = (triggerId: string) => {
    setTriggers(prev => 
      prev.map(trigger => 
        trigger.id === triggerId 
          ? { ...trigger, enabled: !trigger.enabled }
          : trigger
      )
    );
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'event': return Database;
      case 'schedule': return Clock;
      case 'condition': return Settings;
      default: return Settings;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = '/tenant-owner/automation'}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trigger Settings</h1>
              <p className="text-gray-600">Configure automation triggers and conditions</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={18} />
            Add Trigger
          </button>
        </div>

        {/* Trigger List */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Triggers</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your automation triggers</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {triggers.map((trigger) => {
                const TriggerIcon = getTriggerIcon(trigger.type);
                return (
                  <div key={trigger.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <TriggerIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{trigger.name}</h3>
                        <p className="text-sm text-gray-600">{trigger.description}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          trigger.type === 'event' ? 'bg-blue-100 text-blue-700' :
                          trigger.type === 'schedule' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {trigger.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 ${trigger.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                        {trigger.enabled ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                        <span className="text-sm font-medium">
                          {trigger.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => toggleTrigger(trigger.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          trigger.enabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            trigger.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}