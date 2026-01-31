"use client";

import React, { useState } from "react";
import { Ticket } from "lucide-react";
import { PromoCode, NewPromoCode } from "@/types/owner";
import CreatePromoCodeModal from "../CreatePromoCodeModal";
import EditPromoCodeModal from "../EditPromoCodeModal";

interface PromoCodesTabProps {
  promoCodes: PromoCode[];
  createPromoCode: (promo: NewPromoCode) => Promise<boolean>;
  updatePromoCode: (promo: PromoCode) => Promise<boolean>;
  deletePromoCode: (id: string) => Promise<boolean>;
}

export default function PromoCodesTab({
  promoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
}: PromoCodesTabProps) {
  const [showCreatePromo, setShowCreatePromo] = useState(false);
  const [showEditPromo, setShowEditPromo] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

  const handleDeletePromo = async (promo: PromoCode) => {
    if (
      window.confirm(
        `Are you sure you want to delete the promo code "${promo.code}"? This action cannot be undone.`
      )
    ) {
      await deletePromoCode(promo.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Promo Code Management
          </h2>
          <p className="text-gray-600 mt-1">
            Create and manage promotional codes for special pricing
          </p>
        </div>
        <button
          onClick={() => setShowCreatePromo(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Ticket className="w-4 h-4" />
          Create Promo Code
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="space-y-4">
            {promoCodes.map((promo) => (
              <div
                key={promo.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-mono font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-md">
                        {promo.code}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          promo.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {promo.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {promo.usedCount}/{promo.maxUses} uses
                      </span>
                    </div>
                    <p className="text-gray-700 mt-2">{promo.description}</p>
                    <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                      <span>
                        Pricing: ${promo.monthlyPrice}/month or $
                        {promo.yearlyPrice}/year
                      </span>
                      <span>
                        Expires:{" "}
                        {new Date(promo.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingPromo(promo);
                        setShowEditPromo(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePromo(promo)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {promoCodes.length === 0 && (
              <p className="text-sm text-gray-500">No promo codes yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreatePromo && (
        <CreatePromoCodeModal
          onClose={() => setShowCreatePromo(false)}
          onSave={async (newPromo) => {
            const success = await createPromoCode(newPromo);
            if (success) setShowCreatePromo(false);
            return success;
          }}
        />
      )}

      {showEditPromo && editingPromo && (
        <EditPromoCodeModal
          promo={editingPromo}
          onClose={() => {
            setShowEditPromo(false);
            setEditingPromo(null);
          }}
          onSave={async (updatedPromo) => {
            const success = await updatePromoCode(updatedPromo);
            if (success) {
              setShowEditPromo(false);
              setEditingPromo(null);
            }
            return success;
          }}
        />
      )}
    </div>
  );
}