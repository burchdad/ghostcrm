// Test file to check syntax
'use client'

import React, { useState } from 'react'

export default function TestComponent() {
  const [currentStep, setCurrentStep] = useState(0);
  
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipToIntegrations = () => {
    setCurrentStep(3); // Integration step
  };

  if (currentStep === 5) {
    return <div>Completed</div>;
  }

  // If we're on the integration step, render the full integration component
  if (currentStep === 3) {
    return <div>Integration</div>;
  }

  const CurrentStepComponent = null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl">
        <h1>Test Component</h1>
      </div>
    </div>
  );
}