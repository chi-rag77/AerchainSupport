"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Folder, FileText, Search, Plus, ChevronRight, 
  MoreVertical, FileCode, BookOpen, ShieldCheck,
  Upload, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LIBRARY_STRUCTURE = [
  {
    name: "Product Documentation",
    icon: BookOpen,
    items: [
      { name: "Implementation Guides", count: 12, type: 'folder' },
      { name: "API Documentation", count: 8, type: 'folder' },
      { name: "Architecture Diagrams", count: 5, type: 'folder' },
    ]
  },
  {
    name: "Customer Specific",
    icon: ShieldCheck,
    items: [
      { name: "Acme Corp Implementation", count: 4, type: 'folder' },
      { name: "Nova Retail Integration", count: 3, type: 'folder' },
      { name: "GlobalTech Workflow", count: 6, type: 'folder' },
    ]
  },
  {
    name: "Support SOPs",
    icon: FileCode,
    items: [
      { name: "Troubleshooting Playbooks", count: 15, type: 'folder' },
      { name: "Known Issues", count: 24, type: 'folder' },
      { name: "Workarounds", count: 9, type: 'folder' },
    ]
  }
];

const KnowledgeLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
          <Input 
            placeholder="Search library..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-white dark:bg-gray-800 border-none rounded-xl shadow-sm"
          />
        </div>
        <Button className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 px-6 shadow-lg shadow-indigo-500/20">
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>

      <ScrollArea className="flex-1 pr-4 -mr-4">
        <div className="space-y-8">
          {LIBRARY_STRUCTURE.map((section) => (
            <div key={section.name} className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <section.icon className="h-4 w-4 text-indigo-600" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  {section.name}
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {section.items.map((item) => (
                  <Card key={item.name} className="group border-none bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer rounded-2xl overflow-hidden">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                          <Folder className="h-5 w-5 text-muted-foreground group-hover:text-indigo-600" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-foreground group-hover:text-indigo-600 transition-colors">{item.name}</span>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{item.count} Documents</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default KnowledgeLibrary;