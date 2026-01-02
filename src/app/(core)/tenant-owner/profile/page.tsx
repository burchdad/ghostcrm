"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/SupabaseAuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import { 
  Building2, 
  MapPin,
  Phone,
  Mail,
  Globe,
  Upload,
  Save,
  Edit3,
  Eye,
  EyeOff,
  Calendar,
  Users,
  Award,
  Target,
  Palette,
  Settings,
  Shield,
  CreditCard,
  FileText,
  Image,
  Link,
  Clock,
  Check,
  X,
  Plus,
  Trash2
} from "lucide-react";

interface OrganizationProfile {
  basic: {
    name: string;
    tagline: string;
    description: string;
    logo: string;
    website: string;
    founded: string;
    size: string;
    industry: string;
  };
  contact: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoVariations: string[];
    brandAssets: string[];
  };
  social: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
    youtube: string;
  };
  business: {
    mission: string;
    vision: string;
    values: string[];
    certifications: string[];
    awards: string[];
  };
  settings: {
    publicProfile: boolean;
    showTeamSize: boolean;
    showRevenue: boolean;
    allowDirectContact: boolean;
    timezone: string;
    currency: string;
  };
}

function OrganizationProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<OrganizationProfile>({
    basic: {
      name: 'Acme Corporation',
      tagline: 'Innovative Solutions for Modern Business',
      description: 'We are a leading technology company focused on delivering cutting-edge solutions that empower businesses to achieve their goals. Our team of experts combines industry knowledge with innovative thinking to create products and services that make a real difference.',
      logo: '/logos/acme-logo.png',
      website: 'https://acme.com',
      founded: '2018',
      size: '50-100',
      industry: 'Technology'
    },
    contact: {
      email: 'info@acme.com',
      phone: '+1 (555) 123-4567',
      address: {
        street: '123 Business Avenue',
        city: 'San Francisco',
        state: 'California',
        zipCode: '94105',
        country: 'United States'
      }
    },
    branding: {
      primaryColor: '#2563EB',
      secondaryColor: '#64748B',
      accentColor: '#F59E0B',
      logoVariations: ['/logos/acme-light.png', '/logos/acme-dark.png'],
      brandAssets: ['/assets/brand-guidelines.pdf', '/assets/logo-pack.zip']
    },
    social: {
      linkedin: 'https://linkedin.com/company/acme',
      twitter: 'https://twitter.com/acme',
      facebook: 'https://facebook.com/acme',
      instagram: 'https://instagram.com/acme',
      youtube: 'https://youtube.com/acme'
    },
    business: {
      mission: 'To empower businesses worldwide with innovative technology solutions that drive growth and success.',
      vision: 'To be the most trusted technology partner for businesses of all sizes, enabling them to thrive in the digital age.',
      values: ['Innovation', 'Customer Success', 'Integrity', 'Collaboration', 'Excellence'],
      certifications: ['ISO 9001:2015', 'SOC 2 Type II', 'GDPR Compliant'],
      awards: ['Best Tech Startup 2022', 'Customer Choice Award 2023', 'Innovation Excellence 2023']
    },
    settings: {
      publicProfile: true,
      showTeamSize: true,
      showRevenue: false,
      allowDirectContact: true,
      timezone: 'America/Los_Angeles',
      currency: 'USD'
    }
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [newAward, setNewAward] = useState('');

  useRibbonPage({
    context: "profile",
    enable: [
      "export",
      "profile",
      "notifications",
      "theme",
      "language",
      "automation"
    ],
    disable: []
  });

  // Redirect non-tenant owners
  useEffect(() => {
    if (!loading && user) {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isSubdomain = hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname.includes('.localhost');
      const isTenantOwner = user.role === 'owner' && isSubdomain;
      
      if (!isTenantOwner) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/tenant-owner/profile');
        // const data = await response.json();
        // setProfile(data);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/tenant-owner/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profile)
      // });
      
      setHasChanges(false);
      setIsEditing(false);
      // Show success toast
    } catch (error) {
      console.error('Error saving profile:', error);
      // Show error toast
    }
  };

  const handleInputChange = (section: keyof OrganizationProfile, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleNestedInputChange = (section: keyof OrganizationProfile, nested: string, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nested]: {
          ...prev[section][nested],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const addValue = () => {
    if (newValue.trim()) {
      setProfile(prev => ({
        ...prev,
        business: {
          ...prev.business,
          values: [...prev.business.values, newValue.trim()]
        }
      }));
      setNewValue('');
      setHasChanges(true);
    }
  };

  const removeValue = (index: number) => {
    setProfile(prev => ({
      ...prev,
      business: {
        ...prev.business,
        values: prev.business.values.filter((_, i) => i !== index)
      }
    }));
    setHasChanges(true);
  };

  const addAward = () => {
    if (newAward.trim()) {
      setProfile(prev => ({
        ...prev,
        business: {
          ...prev.business,
          awards: [...prev.business.awards, newAward.trim()]
        }
      }));
      setNewAward('');
      setHasChanges(true);
    }
  };

  const removeAward = (index: number) => {
    setProfile(prev => ({
      ...prev,
      business: {
        ...prev.business,
        awards: prev.business.awards.filter((_, i) => i !== index)
      }
    }));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <I18nProvider>
        <ToastProvider>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </ToastProvider>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <ToastProvider>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Organization Profile</h1>
                  <p className="text-gray-600 mt-1">Manage your company's public profile and branding</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {hasChanges && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Unsaved changes</span>
                </div>
              )}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
              {hasChanges && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'basic', label: 'Basic Info', icon: Building2 },
                { id: 'contact', label: 'Contact', icon: Phone },
                { id: 'branding', label: 'Branding', icon: Palette },
                { id: 'social', label: 'Social Media', icon: Link },
                { id: 'business', label: 'Business Info', icon: Target },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={profile.basic.name}
                        onChange={(e) => handleInputChange('basic', 'name', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                      <input
                        type="text"
                        value={profile.basic.tagline}
                        onChange={(e) => handleInputChange('basic', 'tagline', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={profile.basic.description}
                        onChange={(e) => handleInputChange('basic', 'description', e.target.value)}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Founded</label>
                      <input
                        type="text"
                        value={profile.basic.founded}
                        onChange={(e) => handleInputChange('basic', 'founded', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                      <select
                        value={profile.basic.size}
                        onChange={(e) => handleInputChange('basic', 'size', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      >
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-100">51-100 employees</option>
                        <option value="101-500">101-500 employees</option>
                        <option value="500+">500+ employees</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                      <input
                        type="text"
                        value={profile.basic.industry}
                        onChange={(e) => handleInputChange('basic', 'industry', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        value={profile.basic.website}
                        onChange={(e) => handleInputChange('basic', 'website', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Logo</h3>
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    {profile.basic.logo ? (
                      <img src={profile.basic.logo} alt="Company Logo" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <Image className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <button className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto">
                      <Upload className="h-4 w-4" />
                      Upload Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profile.contact.email}
                      onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={profile.contact.phone}
                      onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={profile.contact.address.street}
                      onChange={(e) => handleNestedInputChange('contact', 'address', 'street', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={profile.contact.address.city}
                        onChange={(e) => handleNestedInputChange('contact', 'address', 'city', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={profile.contact.address.state}
                        onChange={(e) => handleNestedInputChange('contact', 'address', 'state', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        value={profile.contact.address.zipCode}
                        onChange={(e) => handleNestedInputChange('contact', 'address', 'zipCode', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={profile.contact.address.country}
                        onChange={(e) => handleNestedInputChange('contact', 'address', 'country', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Info Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mission & Vision</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mission Statement</label>
                      <textarea
                        value={profile.business.mission}
                        onChange={(e) => handleInputChange('business', 'mission', e.target.value)}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vision Statement</label>
                      <textarea
                        value={profile.business.vision}
                        onChange={(e) => handleInputChange('business', 'vision', e.target.value)}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Values</h3>
                  <div className="space-y-3">
                    {profile.business.values.map((value, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-gray-900">{value}</span>
                        {isEditing && (
                          <button
                            onClick={() => removeValue(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          placeholder="Add a new value"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={addValue}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
                  <div className="space-y-2">
                    {profile.business.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-gray-900">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Awards & Recognition</h3>
                  <div className="space-y-3">
                    {profile.business.awards.map((award, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-600" />
                          <span className="text-gray-900">{award}</span>
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => removeAward(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newAward}
                          onChange={(e) => setNewAward(e.target.value)}
                          placeholder="Add a new award"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={addAward}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Visibility Settings</label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profile.settings.publicProfile}
                          onChange={(e) => handleInputChange('settings', 'publicProfile', e.target.checked)}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-900">Make profile public</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profile.settings.showTeamSize}
                          onChange={(e) => handleInputChange('settings', 'showTeamSize', e.target.checked)}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-900">Show team size</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profile.settings.allowDirectContact}
                          onChange={(e) => handleInputChange('settings', 'allowDirectContact', e.target.checked)}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-900">Allow direct contact</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Regional Settings</label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Timezone</label>
                        <select
                          value={profile.settings.timezone}
                          onChange={(e) => handleInputChange('settings', 'timezone', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        >
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/New_York">Eastern Time</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Currency</label>
                        <select
                          value={profile.settings.currency}
                          onChange={(e) => handleInputChange('settings', 'currency', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}

export default function OrganizationProfile() {
  return <OrganizationProfilePage />;
}