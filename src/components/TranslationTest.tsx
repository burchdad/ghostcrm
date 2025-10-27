"use client";

import React from 'react';
import { useI18n } from './utils/I18nProvider';

export default function TranslationTest() {
  const { t, lang, setLang } = useI18n();

  return (
    <div className="p-6 space-y-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800">Translation System Test</h2>
      
      <div className="space-y-2">
        <p><strong>Current Language:</strong> {lang}</p>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setLang('en')}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            English
          </button>
          <button 
            onClick={() => setLang('es')}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Español
          </button>
          <button 
            onClick={() => setLang('fr')}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Français
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Common Translations</h3>
          <ul className="space-y-1 text-sm">
            <li><strong>Welcome:</strong> {t('welcome', 'common')}</li>
            <li><strong>Loading:</strong> {t('loading', 'common')}</li>
            <li><strong>Save:</strong> {t('save', 'common')}</li>
            <li><strong>Cancel:</strong> {t('cancel', 'common')}</li>
            <li><strong>Search:</strong> {t('search', 'common')}</li>
            <li><strong>Settings:</strong> {t('settings', 'common')}</li>
          </ul>
        </div>

        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Navigation</h3>
          <ul className="space-y-1 text-sm">
            <li><strong>Dashboard:</strong> {t('dashboard', 'navigation')}</li>
            <li><strong>Leads:</strong> {t('leads', 'navigation')}</li>
            <li><strong>Deals:</strong> {t('deals', 'navigation')}</li>
            <li><strong>Contacts:</strong> {t('contacts', 'navigation')}</li>
            <li><strong>Calendar:</strong> {t('calendar', 'navigation')}</li>
            <li><strong>Reports:</strong> {t('reports', 'navigation')}</li>
          </ul>
        </div>

        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Features</h3>
          <ul className="space-y-1 text-sm">
            <li><strong>New Lead:</strong> {t('new_lead', 'leads')}</li>
            <li><strong>Lead Status:</strong> {t('status', 'leads')}</li>
            <li><strong>Lead Source:</strong> {t('source', 'leads')}</li>
            <li><strong>Priority:</strong> {t('priority', 'deals')}</li>
            <li><strong>Deal Value:</strong> {t('deal_value', 'deals')}</li>
            <li><strong>Close Date:</strong> {t('close_date', 'deals')}</li>
          </ul>
        </div>
      </div>

      <div className="p-4 border rounded bg-gray-50">
        <h3 className="font-semibold mb-2">AI Features</h3>
        <ul className="space-y-1 text-sm">
          <li><strong>Smart Suggestions:</strong> {t('smart_suggestions', 'ai')}</li>
          <li><strong>Lead Scoring:</strong> {t('lead_scoring', 'ai')}</li>
          <li><strong>Email Generator:</strong> {t('email_generator', 'ai')}</li>
          <li><strong>Data Cleanup:</strong> {t('data_cleanup', 'ai')}</li>
        </ul>
      </div>

      <div className="p-4 border rounded bg-blue-50">
        <h3 className="font-semibold mb-2">Accessibility & UI</h3>
        <ul className="space-y-1 text-sm">
          <li><strong>Search Placeholder:</strong> {t('search', 'placeholders')}</li>
          <li><strong>Loading:</strong> {t('loading', 'accessibility')}</li>
          <li><strong>Menu:</strong> {t('menu', 'accessibility')}</li>
          <li><strong>Undo Action:</strong> {t('undo', 'actions')}</li>
          <li><strong>Redo Action:</strong> {t('redo', 'actions')}</li>
        </ul>
      </div>

      <div className="p-4 border rounded bg-yellow-50">
        <h3 className="font-semibold mb-2">Language Selector</h3>
        <ul className="space-y-1 text-sm">
          <li><strong>Select Language:</strong> {t('select', 'language')}</li>
          <li><strong>English:</strong> {t('english', 'language')}</li>
          <li><strong>Spanish:</strong> {t('spanish', 'language')}</li>
          <li><strong>French:</strong> {t('french', 'language')}</li>
          <li><strong>Current Language:</strong> {t('current', 'language')}</li>
        </ul>
      </div>
    </div>
  );
}