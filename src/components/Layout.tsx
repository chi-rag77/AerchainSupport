"use client";

import React from 'react';
import Navbar from './Navbar';
import { TooltipProvider } from '@/components/ui/tooltip';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
        <Navbar />
        <main className="flex-grow container mx-auto py-6 px-4">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
};

export default Layout;