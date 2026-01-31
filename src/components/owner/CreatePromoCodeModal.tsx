"use client";

import React, { useState } from "react";
import { NewPromoCode } from "@/types/owner";

interface CreatePromoCodeModalProps {
  onClose: () => void;
  onSave: (promoCode: NewPromoCode) => Promise<boolean>;
}

export default function CreatePromoCodeModal({
  onClose,
  onSave,
}: CreatePromoCodeModalProps) {
  const [formData, setFormData] = useState<NewPromoCode>({
    code: "",
    description: "",
    discountType: "fixed",
    discountValue: 0,
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxUses: 1,
    expiresAt: new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000
    ).toISOString().split("T")[0],
    isActive: true,
  });

  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: keyof NewPromoCode, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const payload: NewPromoCode = {
        ...formData,
        expiresAt: new Date(formData.expiresAt).toISOString(),
      };
      const success = await onSave(payload);
      if (!success) console.error("Failed to create promo code");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            Create Promo Code
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promo Code
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                handleInputChange("code", e.target.value.toUpperCase())
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
              placeholder="TESTCLIENT70"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                handleInputChange("description", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          {/* Discount type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Type
            </label>
            <select
              value={formData.discountType}
              onChange={(e) =>
                handleInputChange("discountType", e.target.value as any)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="fixed">Fixed Price</option>
              <option value="percentage">Percentage Off</option>
            </select>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Price ($)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={formData.monthlyPrice}
                onChange={(e) =>
                  handleInputChange(
                    "monthlyPrice",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yearly Price ($)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={formData.yearlyPrice}
                onChange={(e) =>
                  handleInputChange(
                    "yearlyPrice",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Uses
              </label>
              <input
                type="number"
                min={1}
                value={formData.maxUses}
                onChange={(e) =>
                  handleInputChange("maxUses", parseInt(e.target.value) || 1)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date
              </label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) =>
                  handleInputChange("expiresAt", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="create-isActive"
              checked={formData.isActive}
              onChange={(e) =>
                handleInputChange("isActive", e.target.checked)
              }
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label
              htmlFor="create-isActive"
              className="text-sm font-medium text-gray-700"
            >
              Activate immediately
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t">
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
                  Creating...
                </>
              ) : (
                "Create Promo Code"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}