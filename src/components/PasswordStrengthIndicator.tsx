"use client";

import React from 'react';
import { getPasswordStrength } from '@/lib/password-strength';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const strength = getPasswordStrength(password);

  const strengthLabels = ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-blue-500"];

  const getWidth = (index: number) => {
    if (strength === 0) return "w-0";
    if (strength === 1 && index === 0) return "w-full";
    if (strength === 2 && (index === 0 || index === 1)) return "w-full";
    if (strength === 3 && (index === 0 || index === 1 || index === 2)) return "w-full";
    if (strength === 4 && (index === 0 || index === 1 || index === 2 || index === 3)) return "w-full";
    return "w-0";
  };

  return (
    <div className="mt-2">
      <div className="flex space-x-1 h-2 mb-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn(
              "h-full flex-1 rounded-full transition-all duration-300",
              strength > index ? strengthColors[strength - 1] : "bg-gray-200 dark:bg-gray-700"
            )}
          />
        ))}
      </div>
      {password.length > 0 && (
        <p className={cn(
          "text-xs font-medium transition-colors duration-300",
          strength === 0 && "text-red-500",
          strength === 1 && "text-orange-500",
          strength === 2 && "text-yellow-500",
          strength === 3 && "text-green-500",
          strength === 4 && "text-blue-500"
        )}>
          {strengthLabels[strength]}
        </p>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;