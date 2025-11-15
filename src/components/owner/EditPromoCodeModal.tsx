"use client";

import React, { useState } from "react";
import { PromoCode } from "@/types/owner";

interface EditPromoCodeModalProps {
  promo: PromoCode;
  onClose: () => void;
  onSave: (promo: PromoCode) => Promise<boolean>;
}

export default function EditPromoCodeModal({
  promo,
  onClose,
  onSave,
}: EditPromoCodeModalProps) {
  const [formData, setFormData] = useState<PromoCode>(promo);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const success = await onSave(formData);
      if (!success) {
        alert("Failed to update promo code. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const setField = (field: keyof PromoCode, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Edit Promo Code
            </h3>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promo Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setField("code", e.target.value.toUpperCase())
                }
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setField("description", e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                required
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Price ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.monthlyPrice ?? 0}
                  onChange={(e) =>
                    setField(
                      "monthlyPrice",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yearly Price ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.yearlyPrice ?? 0}
                  onChange={(e) =>
                    setField(
                      "yearlyPrice",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Max uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Uses
              </label>
              <input
                type="number"
                min={1}
                value={formData.maxUses}
                onChange={(e) =>
                  setField("maxUses", parseInt(e.target.value) || 1)
                }
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
              />
            </div>

            {/* Expiration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                value={
                  formData.expiresAt
                    ? new Date(formData.expiresAt).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setField(
                    "expiresAt",
                    e.target.value
                      ? new Date(e.target.value).toISOString()
                      : ""
                  )
                }
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
              />
            </div>

            {/* Active */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={formData.isActive}
                onChange={(e) => setField("isActive", e.target.checked)}
                disabled={saving}
                className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:opacity-50"
              />
              <label htmlFor="edit-isActive" className="text-sm text-gray-700">
                Active (users can apply this promo code)
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Promo Code"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}