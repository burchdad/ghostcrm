"use client";

import React from "react";
import { CreditCard } from "lucide-react";

export default function StripeTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Stripe Product Management
          </h2>
          <p className="text-gray-600 mt-2">
            Manage Stripe product synchronization for all plans and pricing. Only
            you as the software owner can access these controls.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Stripe Integration Dashboard
          </h3>
          <p className="text-gray-600 mb-4">
            Full Stripe management interface will be integrated here
          </p>
          <div className="text-sm text-gray-500">
            • Product synchronization
            <br />
            • Pricing management  
            <br />
            • Webhook monitoring
            <br />
            • Transaction analytics
          </div>
        </div>
      </div>
    </div>
  );
}