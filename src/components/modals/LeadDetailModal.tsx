"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from '@/lib/auth/client';
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, User, Building, Mail, Phone, MapPin, DollarSign, Calendar, Star, Tag, Plus } from "lucide-react";

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated?: () => void;
  leadId: string | null;
}

interface LeadData {
  id: string;
  title: string;
  description: string;
  value: number;
  budget: number;
  budget_range: string;
  stage: string;
  priority: string;
  source: string;
  assigned_to: string;
  expected_close_date: string;
  probability: number;
  email: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  timeframe: string;
  vehicle_interest: string;
  lead_score: number;
  referred_by: string;
  campaign_source: string;
  tags: string[];
  custom_fields: any;
  contacts?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company: string;
  };
  created_at: string;
  updated_at: string;
}

export default function LeadDetailModal({ isOpen, onClose, onLeadUpdated, leadId }: LeadDetailModalProps) {
  const { user, tenant } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (isOpen && leadId) {
      loadLeadData();
    }
  }, [isOpen, leadId]);

  const loadLeadData = async () => {
    if (!leadId) return;
    
    setLoading(true);
    try {
      const response = await authenticatedFetch(`/api/leads/${leadId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load lead data');
      }
      
      const data = await response.json();
      console.log('Loaded lead data:', data.data);
      
      // Merge custom_fields data with main data for enhanced fields
      const leadData = data.data;
      const mergedData = {
        ...leadData,
        // Use custom_fields as fallback for enhanced fields
        email: leadData.email || leadData.custom_fields?.email || "",
        address: leadData.address || leadData.custom_fields?.address || "",
        city: leadData.city || leadData.custom_fields?.city || "",
        state: leadData.state || leadData.custom_fields?.state || "",
        zip_code: leadData.zip_code || leadData.custom_fields?.zip_code || "",
        country: leadData.country || leadData.custom_fields?.country || "USA",
        budget: leadData.budget || leadData.custom_fields?.budget || leadData.value || 0,
        budget_range: leadData.budget_range || leadData.custom_fields?.budget_range || "",
        timeframe: leadData.timeframe || leadData.custom_fields?.timeframe || "",
        vehicle_interest: leadData.vehicle_interest || leadData.custom_fields?.vehicle_interest || "",
        lead_score: leadData.lead_score || leadData.custom_fields?.lead_score || leadData.probability || 0,
        referred_by: leadData.referred_by || leadData.custom_fields?.referred_by || "",
        campaign_source: leadData.campaign_source || leadData.custom_fields?.campaign_source || "",
      };
      
      setLeadData(mergedData);
      setIsDirty(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load lead data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof LeadData, value: any) => {
    setLeadData(prev => prev ? { ...prev, [field]: value } : null);
    setIsDirty(true);
  };

  const handleAddTag = () => {
    if (newTag.trim() && leadData && !leadData.tags?.includes(newTag.trim())) {
      const updatedTags = [...(leadData.tags || []), newTag.trim()];
      updateField('tags', updatedTags);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (leadData) {
      const updatedTags = (leadData.tags || []).filter(tag => tag !== tagToRemove);
      updateField('tags', updatedTags);
    }
  };
    if (!leadData) return;
    
    console.log('Saving lead data:', leadData);
    
    setSaving(true);
    try {
      const response = await authenticatedFetch('/api/leads', {
        method: 'PUT',
        body: JSON.stringify(leadData)
      });
      
      console.log('Save response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Save failed with error:', error);
        throw new Error(error.message || 'Failed to update lead');
      }
      
      const result = await response.json();
      console.log('Save successful:', result);
      
      toast({
        title: "Success!",
        description: "Lead updated successfully",
      });
      
      setIsDirty(false);
      onLeadUpdated?.();
      onClose();
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update lead",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Modal open={isOpen} onClose={onClose} title="Lead Details">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading lead data...</span>
        </div>
      </Modal>
    );
  }

  if (!leadData) {
    return (
      <Modal open={isOpen} onClose={onClose} title="Lead Details">
        <div className="p-8 text-center text-gray-500">
          Lead not found or failed to load.
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Lead Details" size="xl">
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
              <User className="h-5 w-5" />
              Basic Information
            </div>
            
            <div>
              <Label htmlFor="title">Lead Title</Label>
              <Input
                id="title"
                value={leadData.title || ""}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description / Notes</Label>
              <Textarea
                id="description"
                value={leadData.description || ""}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stage">Stage</Label>
                <Select value={leadData.stage || ""} onValueChange={(value) => updateField('stage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed_won">Closed Won</SelectItem>
                    <SelectItem value="closed_lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={leadData.priority || ""} onValueChange={(value) => updateField('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={leadData.email || leadData.contacts?.email || ""}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Name</Label>
                <Input
                  value={`${leadData.contacts?.first_name || ""} ${leadData.contacts?.last_name || ""}`.trim() || "Not Available"}
                  disabled
                />
              </div>
              
              <div>
                <Label>Phone</Label>
                <Input
                  value={leadData.contacts?.phone || ""}
                  disabled
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={leadData.address || ""}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={leadData.city || ""}
                  onChange={(e) => updateField('city', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={leadData.state || ""}
                  onChange={(e) => updateField('state', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  value={leadData.zip_code || ""}
                  onChange={(e) => updateField('zip_code', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Financial Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
              <DollarSign className="h-5 w-5" />
              Financial Information
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={leadData.budget || ""}
                  onChange={(e) => updateField('budget', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="value">Deal Value ($)</Label>
                <Input
                  id="value"
                  type="number"
                  value={leadData.value || ""}
                  onChange={(e) => updateField('value', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="probability">Probability (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  value={leadData.probability || ""}
                  onChange={(e) => updateField('probability', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="lead_score">Lead Score</Label>
                <Input
                  id="lead_score"
                  type="number"
                  min="0"
                  max="100"
                  value={leadData.lead_score || ""}
                  onChange={(e) => updateField('lead_score', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
              <Star className="h-5 w-5" />
              Additional Information
            </div>
            
            <div>
              <Label htmlFor="vehicle_interest">Vehicle Interest</Label>
              <Input
                id="vehicle_interest"
                value={leadData.vehicle_interest || ""}
                onChange={(e) => updateField('vehicle_interest', e.target.value)}
                placeholder="e.g., 3rd row SUV"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select value={leadData.timeframe || ""} onValueChange={(value) => updateField('timeframe', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="1-3 months">1-3 months</SelectItem>
                    <SelectItem value="3-6 months">3-6 months</SelectItem>
                    <SelectItem value="6+ months">6+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={leadData.source || ""}
                  onChange={(e) => updateField('source', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="referred_by">Referred By</Label>
              <Input
                id="referred_by"
                value={leadData.referred_by || ""}
                onChange={(e) => updateField('referred_by', e.target.value)}
              />
            </div>
          </div>
          
          {/* Tags Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
              <Tag className="h-5 w-5" />
              Tags
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {leadData.tags && leadData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {leadData.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            Created: {new Date(leadData.created_at).toLocaleDateString()} | 
            Updated: {new Date(leadData.updated_at).toLocaleDateString()}
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              variant={isDirty ? "default" : "outline"}
            >
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Saving...' : isDirty ? 'Save Changes' : 'No Changes'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}