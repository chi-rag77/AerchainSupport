"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, FileText, Globe, User, 
  Plus, Loader2, Trash2, Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import UploadDocumentModal from './UploadDocumentModal';
import { cn } from '@/lib/utils';

const KnowledgeLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['knowledgeDocuments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const { error } = await supabase.from('knowledge_documents').delete().eq('id', id);
      if (error) throw error;
      toast.success("Document deleted.");
      queryClient.invalidateQueries({ queryKey: ['knowledgeDocuments'] });
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-border">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tight">Library</h3>
          <Button 
            size="icon" 
            onClick={() => setIsUploadOpen(true)}
            className="h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
          <Input 
            placeholder="Search docs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pb-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Loading...</span>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground italic text-xs">
              No documents found.
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div 
                key={doc.id}
                className="group relative p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer border border-transparent hover:border-border"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-bold truncate text-foreground">{doc.name}</p>
                    <div className="flex items-center gap-2">
                      {doc.customer_name ? (
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-indigo-600">
                          <User className="h-2.5 w-2.5" /> {doc.customer_name}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-muted-foreground">
                          <Globe className="h-2.5 w-2.5" /> Global
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => handleDelete(doc.id, e)}
                    className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-50 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <Info className="h-3 w-3" />
          {documents.length} Documents Indexed
        </div>
      </div>

      <UploadDocumentModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['knowledgeDocuments'] })}
      />
    </div>
  );
};

export default KnowledgeLibrary;