'use client';

import { useState, useEffect } from 'react';
import { Clock, CreditCard, AlertTriangle } from 'lucide-react';

interface TrialCountdownProps {
  trialEndDate: string;
  hasPaymentMethod: boolean;
  onAddPaymentMethod?: () => void;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function TrialCountdown({ 
  trialEndDate, 
  hasPaymentMethod, 
  onAddPaymentMethod,
  className = ""
}: TrialCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const endDate = new Date(trialEndDate);
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference <= 0) {
        setIsExpired(true);
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [trialEndDate]);

  const getStatusColor = () => {
    if (isExpired) return 'text-red-600 bg-red-50 border-red-200';
    if (timeRemaining.days <= 3) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getStatusIcon = () => {
    if (isExpired) return <AlertTriangle className="h-5 w-5" />;
    if (timeRemaining.days <= 3) return <AlertTriangle className="h-5 w-5" />;
    return <Clock className="h-5 w-5" />;
  };

  const formatTime = (time: TimeRemaining) => {
    if (time.days > 0) {
      return `${time.days}d ${time.hours}h ${time.minutes}m`;
    } else if (time.hours > 0) {
      return `${time.hours}h ${time.minutes}m ${time.seconds}s`;
    } else {
      return `${time.minutes}m ${time.seconds}s`;
    }
  };

  if (isExpired) {
    return (
      <div className={`border rounded-lg p-4 ${getStatusColor()} ${className}`}>
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="font-semibold text-sm">Trial Expired</p>
            <p className="text-xs opacity-75">
              {hasPaymentMethod 
                ? "Your subscription will continue automatically"
                : "Add a payment method to continue using GhostCRM"
              }
            </p>
          </div>
          {!hasPaymentMethod && onAddPaymentMethod && (
            <button
              onClick={onAddPaymentMethod}
              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center space-x-1"
            >
              <CreditCard className="h-4 w-4" />
              <span>Add Payment</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()} ${className}`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <p className="font-semibold text-sm">
              {timeRemaining.days <= 3 ? 'Trial Ending Soon' : 'Trial Active'}
            </p>
            <span className="font-mono text-sm font-bold">
              {formatTime(timeRemaining)}
            </span>
          </div>
          <p className="text-xs opacity-75">
            {hasPaymentMethod 
              ? "Your subscription will continue automatically"
              : "Add a payment method before your trial ends"
            }
          </p>
        </div>
        {!hasPaymentMethod && onAddPaymentMethod && (
          <button
            onClick={onAddPaymentMethod}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
              timeRemaining.days <= 3 
                ? 'bg-amber-600 text-white hover:bg-amber-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Add Payment</span>
          </button>
        )}
      </div>
      
      {/* Detailed time breakdown for longer trials */}
      {timeRemaining.days > 3 && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="text-xs">
              <div className="font-bold text-lg">{timeRemaining.days}</div>
              <div className="opacity-75">Days</div>
            </div>
            <div className="text-xs">
              <div className="font-bold text-lg">{timeRemaining.hours}</div>
              <div className="opacity-75">Hours</div>
            </div>
            <div className="text-xs">
              <div className="font-bold text-lg">{timeRemaining.minutes}</div>
              <div className="opacity-75">Minutes</div>
            </div>
            <div className="text-xs">
              <div className="font-bold text-lg">{timeRemaining.seconds}</div>
              <div className="opacity-75">Seconds</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}