'use client';

import React, { useState, useEffect } from 'react';
import { getBrowserSupabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Building2, Users2, Settings2, ArrowRight, Loader2 } from 'lucide-react';
import './setup.css';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
}

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    organizationName: '',
    subdomain: '',
    industry: '',
    teamSize: '',
    phoneNumber: '',
    businessHours: 'Mon-Fri 9AM-5PM',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const supabase = getBrowserSupabase();
  const router = useRouter();

  useEffect(() => {
    checkUserAndOrganization();
  }, []);

  async function checkUserAndOrganization() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user as User);

      // Check if user is an owner (setup is only for tenant owners)
      const { data: userRole } = await supabase
        .from('user_organizations')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!userRole || userRole.role !== 'owner') {
        // Redirect non-owners to dashboard - they don't need setup
        router.push('/dashboard');
        return;
      }

      // Check if user already has an organization
      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organizations(id, name, subdomain)')
        .eq('user_id', user.id)
        .eq('role', 'owner')
        .single();

      if (userOrg?.organizations) {
        setOrganization(userOrg.organizations as Organization);
        setCurrentStep(2); // Skip org creation
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  }

  async function createOrganization() {
    if (!user) return false;
    
    setLoading(true);
    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.organizationName,
          subdomain: formData.subdomain,
          settings: {
            industry: formData.industry,
            team_size: formData.teamSize,
            phone_number: formData.phoneNumber,
            business_hours: formData.businessHours,
            time_zone: formData.timeZone
          }
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Link user to organization as owner
      const { error: linkError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: user.id,
          organization_id: org.id,
          role: 'owner'
        });

      if (linkError) throw linkError;

      setOrganization(org);
      return true;
    } catch (error) {
      console.error('Error creating organization:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function completeSetup() {
    setLoading(true);
    try {
      // Mark setup as complete
      await supabase
        .from('organizations')
        .update({ setup_completed: true })
        .eq('id', organization?.id);

      // Redirect to their tenant subdomain dashboard
      if (organization?.subdomain) {
        // Redirect to their own tenant subdomain
        window.location.href = `https://${organization.subdomain}.ghostcrm.com/tenant-owner/dashboard`;
      } else {
        // Fallback to tenant-owner dashboard
        router.push('/tenant-owner/dashboard');
      }
    } catch (error) {
      console.error('Error completing setup:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      const success = await createOrganization();
      if (success) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      await completeSetup();
    }
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.organizationName && formData.subdomain && formData.industry;
    }
    return true;
  };

  const steps = [
    { number: 1, title: 'Organization', icon: Building2, description: 'Set up your company' },
    { number: 2, title: 'Customize', icon: Settings2, description: 'Configure preferences' },
    { number: 3, title: 'Complete', icon: CheckCircle2, description: 'Finish setup' }
  ];

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <h1>Welcome to GhostCRM</h1>
          <p>Let's get your account set up in just a few steps</p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          {steps.map((step) => (
            <div 
              key={step.number}
              className={`progress-step ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
            >
              <div className="step-icon">
                <step.icon size={20} />
              </div>
              <div className="step-content">
                <span className="step-title">{step.title}</span>
                <span className="step-description">{step.description}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="step-content-area">
          {currentStep === 1 && (
            <div className="step-form">
              <h2>Create Your Organization</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Organization Name *</label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                    placeholder="Your Company Name"
                  />
                </div>
                <div className="form-group">
                  <label>Subdomain *</label>
                  <input
                    type="text"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase()})}
                    placeholder="yourcompany"
                  />
                  <small>.ghostcrm.com</small>
                </div>
                <div className="form-group">
                  <label>Industry *</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  >
                    <option value="">Select Industry</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="education">Education</option>
                    <option value="automotive">Automotive</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Team Size</label>
                  <select
                    value={formData.teamSize}
                    onChange={(e) => setFormData({...formData, teamSize: e.target.value})}
                  >
                    <option value="">Select Size</option>
                    <option value="1-5">1-5 people</option>
                    <option value="6-20">6-20 people</option>
                    <option value="21-50">21-50 people</option>
                    <option value="51-100">51-100 people</option>
                    <option value="100+">100+ people</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-form">
              <h2>Customize Your Experience</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Business Phone</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="form-group">
                  <label>Business Hours</label>
                  <input
                    type="text"
                    value={formData.businessHours}
                    onChange={(e) => setFormData({...formData, businessHours: e.target.value})}
                    placeholder="Mon-Fri 9AM-5PM"
                  />
                </div>
                <div className="form-group">
                  <label>Time Zone</label>
                  <select
                    value={formData.timeZone}
                    onChange={(e) => setFormData({...formData, timeZone: e.target.value})}
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="America/Anchorage">Alaska Time</option>
                    <option value="Pacific/Honolulu">Hawaii Time</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-form completion-step">
              <div className="completion-icon">
                <CheckCircle2 size={64} />
              </div>
              <h2>Setup Complete!</h2>
              <p>Your GhostCRM account is ready to use. You can now start managing your leads and growing your business.</p>
              
              <div className="feature-preview">
                <div className="feature-item">
                  <Users2 size={24} />
                  <span>Manage leads and contacts</span>
                </div>
                <div className="feature-item">
                  <Building2 size={24} />
                  <span>Track deals and opportunities</span>
                </div>
                <div className="feature-item">
                  <Settings2 size={24} />
                  <span>Automate your workflow</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="step-navigation">
          <button
            onClick={handleNext}
            disabled={!isStepValid() || loading}
            className="next-button"
          >
            {loading ? (
              <Loader2 size={20} className="spinning" />
            ) : (
              <>
                {currentStep === 3 ? 'Get Started' : 'Continue'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}