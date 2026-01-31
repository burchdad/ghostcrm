"use client";
import React, { useState } from "react";
import { Modal } from "./Modal";
import { User, Mail, Phone, MapPin, Building, Calendar, Save, X } from "lucide-react";

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function UserProfileModal({ open, onClose }: UserProfileModalProps) {
  // Mock user data - in real app, this would come from your auth/user context
  const [profile, setProfile] = useState({
    name: "John Smith",
    email: "john.smith@company.com",
    phone: "(555) 123-4567",
    title: "Sales Manager",
    department: "Sales",
    location: "New York, NY",
    joinDate: "2023-01-15",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // In real app, save to backend
    console.log("Saving profile:", profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h2 className="text-xl font-semibold">User Profile</h2>
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-6 mb-6">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
              />
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors">
                <User className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 bg-transparent focus:outline-none"
                  />
                ) : (
                  <h3 className="text-2xl font-bold text-gray-900">{profile.name}</h3>
                )}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {isEditing ? "Cancel" : "Edit"}
                </button>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <span>{profile.title}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b pb-2">Contact Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-gray-900">{profile.email}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-gray-900">{profile.phone}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-gray-900">{profile.location}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b pb-2">Work Information</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Department</label>
                  {isEditing ? (
                    <select
                      value={profile.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Support">Support</option>
                      <option value="Management">Management</option>
                      <option value="IT">IT</option>
                    </select>
                  ) : (
                    <span className="text-gray-900">{profile.department}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Employee ID</label>
                  <span className="text-gray-900">EMP-2023-001</span>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Activity Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">127</div>
                <div className="text-xs text-gray-500">Leads Generated</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">89</div>
                <div className="text-xs text-gray-500">Deals Closed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">245</div>
                <div className="text-xs text-gray-500">Calls Made</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">98%</div>
                <div className="text-xs text-gray-500">Goal Achievement</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}