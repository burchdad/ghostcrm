'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Globe, 
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnboardingSubdomainSetupProps {
  organizationId: string;
  organizationName: string;
  ownerEmail: string;
  onComplete: (subdomainData: any) => void;
  onSkip?: () => void;
}

interface SubdomainStatus {
  subdomain: string;
  fullDomain: string;
  status: 'pending' | 'active' | 'failed';
  message: string;
  dnsRecords?: any[];
}

export default function OnboardingSubdomainSetup({ 
  organizationId, 
  organizationName, 
  ownerEmail, 
  onComplete,
  onSkip 
}: OnboardingSubdomainSetupProps) {
  const [step, setStep] = useState<'input' | 'provisioning' | 'complete'>('input');
  const [subdomain, setSubdomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SubdomainStatus | null>(null);
  const [error, setError] = useState<string>('');
  
  const { toast } = useToast();

  // Auto-generate subdomain suggestion from organization name
  useEffect(() => {
    if (organizationName && !subdomain) {
      const suggestion = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
      if (suggestion.length >= 3) {
        setSubdomain(suggestion);
      }
    }
  }, [organizationName, subdomain]);

  const validateSubdomain = (value: string): boolean => {
    const pattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    return value.length >= 3 && value.length <= 63 && pattern.test(value);
  };

  const checkSubdomainAvailability = async (subdomainValue: string) => {
    try {
      const response = await fetch(`/api/subdomains/provision?subdomain=${subdomainValue}`);
      const data = await response.json();
      
      if (response.status === 404) {
        // Subdomain is available
        return { available: true };
      } else if (response.status === 200) {
        // Subdomain exists
        return { available: false, error: 'Subdomain is already taken' };
      } else {
        return { available: false, error: data.error || 'Unable to check availability' };
      }
    } catch (error) {
      return { available: true }; // Assume available if check fails
    }
  };

  const handleSubdomainChange = async (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(cleaned);
    setError('');
    setSuggestions([]);

    if (cleaned.length >= 3 && validateSubdomain(cleaned)) {
      // Debounce the availability check
      const timeoutId = setTimeout(async () => {
        const result = await checkSubdomainAvailability(cleaned);
        if (!result.available) {
          setError(result.error || 'Subdomain not available');
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  };

  const handleProvisionSubdomain = async () => {
    if (!validateSubdomain(subdomain)) {
      setError('Please enter a valid subdomain (3-63 characters, letters, numbers, and hyphens only)');
      return;
    }

    setLoading(true);
    setError('');
    setStep('provisioning');

    try {
      const response = await fetch('/api/subdomains/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          organizationId,
          organizationName,
          ownerEmail,
          customDomain: customDomain || undefined,
          autoProvision: true
        })
      });

      const data = await response.json();

      if (data.success) {
        setStatus({
          subdomain: data.subdomain,
          fullDomain: data.fullDomain,
          status: data.status,
          message: data.message,
          dnsRecords: data.dnsRecords
        });

        if (data.status === 'active') {
          setStep('complete');
          toast({
            title: 'Success!',
            description: `Your subdomain ${data.subdomain}.ghostcrm.ai is ready to use!`,
          });
        } else {
          // Keep polling for status updates
          pollSubdomainStatus(subdomain);
        }
      } else {
        setError(data.error || 'Failed to create subdomain');
        setStep('input');
        
        // Show suggestions if available
        if (data.suggestions) {
          setSuggestions(data.suggestions);
        }
      }
    } catch (error) {
      setError('Failed to create subdomain. Please try again.');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const pollSubdomainStatus = async (subdomainValue: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/subdomains/provision?subdomain=${subdomainValue}`);
        const data = await response.json();

        if (data.success) {
          setStatus(prev => prev ? { ...prev, ...data } : data);
          
          if (data.status === 'active') {
            clearInterval(pollInterval);
            setStep('complete');
            toast({
              title: 'Subdomain Ready!',
              description: `${data.fullDomain} is now active and ready to use!`,
            });
          } else if (data.status === 'failed') {
            clearInterval(pollInterval);
            setError('Subdomain provisioning failed. Please contact support.');
            setStep('input');
          }
        }
      } catch (error) {
        // Continue polling on error
      }
    }, 3000);

    // Stop polling after 2 minutes
    setTimeout(() => clearInterval(pollInterval), 120000);
  };

  const handleComplete = () => {
    if (status) {
      onComplete({
        subdomain: status.subdomain,
        fullDomain: status.fullDomain,
        status: status.status
      });
    }
  };

  const getStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          step === 'input' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {step !== 'input' ? <CheckCircle className="h-4 w-4" /> : '1'}
        </div>
        <div className={`h-0.5 w-12 ${
          ['provisioning', 'complete'].includes(step) ? 'bg-green-500' : 'bg-gray-300'
        }`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          step === 'provisioning' ? 'bg-blue-500 text-white' : 
          step === 'complete' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
        }`}>
          {step === 'complete' ? <CheckCircle className="h-4 w-4" /> : 
           step === 'provisioning' ? <RefreshCw className="h-4 w-4 animate-spin" /> : '2'}
        </div>
        <div className={`h-0.5 w-12 ${
          step === 'complete' ? 'bg-green-500' : 'bg-gray-300'
        }`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          step === 'complete' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
        }`}>
          {step === 'complete' ? <CheckCircle className="h-4 w-4" /> : '3'}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Set Up Your Subdomain
        </CardTitle>
        <CardDescription>
          Choose your unique subdomain to access your GhostCRM instance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {getStepIndicator()}

        {step === 'input' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subdomain">Choose Your Subdomain</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="subdomain"
                  placeholder="your-company"
                  value={subdomain}
                  onChange={(e) => handleSubdomainChange(e.target.value)}
                  className={error ? 'border-red-500' : ''}
                />
                <span className="text-gray-500">.ghostcrm.ai</span>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {subdomain && !error && (
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {subdomain}.ghostcrm.ai is available!
                </div>
              )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <Label>Available Alternatives</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setSubdomain(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
              <Input
                id="customDomain"
                placeholder="crm.yourcompany.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
              />
              <div className="text-sm text-gray-500">
                If you have your own domain, you can use it instead of the .ghostcrm.ai subdomain
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">Your CRM URL will be:</div>
                  <div className="text-blue-700 font-mono">
                    {customDomain || `${subdomain || 'your-subdomain'}.ghostcrm.ai`}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleProvisionSubdomain} 
                disabled={!subdomain || !!error || loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Setting Up...
                  </>
                ) : (
                  <>
                    Set Up Subdomain
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              {onSkip && (
                <Button variant="outline" onClick={onSkip}>
                  Skip For Now
                </Button>
              )}
            </div>
          </div>
        )}

        {step === 'provisioning' && status && (
          <div className="space-y-4">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-medium">Setting Up Your Subdomain</h3>
              <p className="text-gray-600">{status.message}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Subdomain:</span>
                  <Badge>{status.subdomain}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Full Domain:</span>
                  <span className="font-mono text-sm">{status.fullDomain}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-600">Provisioning...</span>
                  </div>
                </div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This process typically takes 1-3 minutes. Please wait while we set up your subdomain and configure DNS.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === 'complete' && status && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-medium text-green-700">Subdomain Ready!</h3>
              <p className="text-gray-600">Your GhostCRM instance is now accessible</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Your CRM URL:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{status.fullDomain}</span>
                    <ExternalLink 
                      className="h-4 w-4 cursor-pointer text-blue-500 hover:text-blue-700" 
                      onClick={() => window.open(`https://${status.fullDomain}`, '_blank')}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your subdomain has been successfully set up! You can now access your GhostCRM instance at the URL above. 
                A welcome email with login instructions has been sent to {ownerEmail}.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button onClick={handleComplete} className="flex-1">
                Continue Setup
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open(`https://${status.fullDomain}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Site
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}