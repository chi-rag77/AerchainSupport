"use client";

import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import KnowledgeLibrary from "@/components/knowledge/KnowledgeLibrary";
import AIKnowledgeAssistant from "@/components/knowledge/AIKnowledgeAssistant";

const KnowledgeHub = () => {
  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#F6F8FB] dark:bg-gray-950">
        
        {/* Sidebar: Library */}
        <aside className="w-80 shrink-0 hidden lg:block">
          <KnowledgeLibrary />
        </aside>

        {/* Main: ChatGPT UI */}
        <main className="flex-1 flex flex-col min-w-0">
          <AIKnowledgeAssistant />
        </main>

      </div>
    </TooltipProvider>
  );
};

export default KnowledgeHub;