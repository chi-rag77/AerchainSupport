"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Folder, Search, ChevronRight, BookOpen, 
  ShieldCheck, FileCode, Upload, Loader2 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { invokeEdgeFunction } from '@/lib/apiClient';

const LIBRARY_STRUCTURE = [
  { name: "Product Documentation", icon: BookOpen, category: 'Product' },
  { name: "Customer Specific", icon: ShieldCheck, category: 'Customer Specific' },
  { name: "Support SOPs", icon: FileCode, category: 'Support SOP' }
];

const KnowledgeLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${file.name}...`);

    try {
      const filePath = `${Date.now()}_${file.name}`;
      
      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('knowledge')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Create DB Record
      const { data: doc, error: dbError } = await supabase
        .from('knowledge_documents')
        .insert({
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          category: 'Product', // Default
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Trigger AI Processing
      toast.loading("AI is indexing document for RAG...", { id: toastId });
      await invokeEdgeFunction('process-knowledge-document', {
        body: { documentId: doc.id }
      });

      toast.success("Document indexed and ready for AI search!", { id: toastId });
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`, { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <input type="file" className="hidden" ref={fileInputRef} onChange={handleUpload} accept=".txt,.md,.pdf" />
      
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
        <Button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 px-6 shadow-lg shadow-indigo-500/20"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
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
                <Card className="group border-none bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer rounded-2xl overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <Folder className="h-5 w-5 text-muted-foreground group-hover:text-indigo-600" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-foreground group-hover:text-indigo-600 transition-colors">General Docs</span>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Browse Files</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default KnowledgeLibrary;