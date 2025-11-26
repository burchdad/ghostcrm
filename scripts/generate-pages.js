const fs = require('fs');
const path = require('path');

const pages = [
  { name: 'api-docs', title: 'API Documentation', description: 'Complete API documentation for developers.' },
  { name: 'roadmap', title: 'Product Roadmap', description: 'See what features we\'re building next.' },
  { name: 'documentation', title: 'Documentation', description: 'User guides and technical documentation.' },
  { name: 'training', title: 'Training', description: 'Video tutorials and training materials.' },
  { name: 'status', title: 'System Status', description: 'Real-time system status and uptime information.' },
  { name: 'compliance', title: 'Compliance', description: 'Our compliance certifications and standards.' }
];

function createPageComponent(pageInfo) {
  const componentName = pageInfo.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  
  return `'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import '../../styles/shared-pages.css'

export default function ${componentName}Page() {
  return (
    <div className="shared-page">
      <div className="shared-page-background">
        <div className="shared-bg-gradient" />
        <div className="shared-bg-blur-1" />
        <div className="shared-bg-blur-2" />
        <div className="shared-bg-blur-3" />
      </div>
      <div className="shared-container">
        <div className="shared-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>${pageInfo.title}</span>
        </div>
        <div className="shared-header">
          <h1 className="shared-title">${pageInfo.title}</h1>
          <p className="shared-subtitle">${pageInfo.description}</p>
        </div>
        <div className="shared-section">
          <h2>Coming Soon</h2>
          <p>This section is currently under development. Please check back soon for updates.</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '2rem' }}>
          <Link href="/" className="shared-button secondary">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}`
}

// Generate all the page files
function generatePages() {
  console.log('🚀 Starting page generation...');
  
  const srcDir = path.join(__dirname, '..', 'src', 'app');
  
  pages.forEach(page => {
    try {
      // Create directory for the page
      const pageDir = path.join(srcDir, page.name);
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
        console.log(`📁 Created directory: ${page.name}`);
      }
      
      // Generate page component
      const pageContent = createPageComponent(page);
      const pagePath = path.join(pageDir, 'page.tsx');
      
      // Only write if file doesn't exist or is different
      let shouldWrite = true;
      if (fs.existsSync(pagePath)) {
        const existingContent = fs.readFileSync(pagePath, 'utf8');
        if (existingContent === pageContent) {
          shouldWrite = false;
          console.log(`⏭️  Skipped ${page.name} (no changes)`);
        }
      }
      
      if (shouldWrite) {
        fs.writeFileSync(pagePath, pageContent);
        console.log(`✅ Generated: ${page.name}/page.tsx`);
      }
      
    } catch (error) {
      console.error(`❌ Error generating ${page.name}:`, error.message);
    }
  });
  
  console.log('🎉 Page generation complete!');
}

// Run the generator
if (require.main === module) {
  generatePages();
}

module.exports = { generatePages, createPageComponent, pages };