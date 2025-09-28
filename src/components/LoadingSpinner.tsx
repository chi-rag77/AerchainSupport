"use client";

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Logo from './Logo';

const loadingMessages = [
  "Fetching the latest ticket data from Freshdesk...",
  "Just a moment while we set up your insights!",
  "Optimizing your support workflow...",
  "Did you know? Our platform helps streamline communication!",
  "Tip: Use the search bar to quickly find specific tickets.",
  "Quote: 'The only way to do great work is to love what you do.' - Steve Jobs",
  "Preparing your comprehensive ticket overview...",
];

const LoadingSpinner = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 5000); // Change message every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-background p-4 text-center">
      <div className="relative mb-8">
        <Logo className="h-24 w-auto text-primary animate-pulse-slow" />
        <Loader2 className="absolute inset-0 m-auto h-12 w-12 text-primary animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        {loadingMessages[currentMessageIndex]}
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
        Your support data is being meticulously organized for you.
      </p>
    </div>
  );
};

export default LoadingSpinner;