"use client";

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Upload, Loader2, FileText, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { invokeEdgeFunction } from '@/lib/apiClient';
import { useQuery } from '@tanstack/react-query';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadDocumentModal = ({ isOpen, onClose, onSuccess }: UploadDocumentModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [customerName, setCustomerName] = useState("All");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch unique customers for the dropdown
  const { data: uniqueCustomers = [] } = useQuery<string[]>({
    queryKey: ["uniqueCustomersForUpload"],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('cf_company').limit(1000);
      if (error) throw error;
      return Array.from(new Set((data || []).map(t => t.cf_company).filter(Boolean))) as string[];
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!docName) setDocName(selectedFile.name.split('.')[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !docName) return;

    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${docName}...`);

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
          name: docName,
          file_path: filePath,
          file_type: file.type,
          category: customerName === 'All' ? 'Product' : 'Customer Specific',
          customer_name: customerName === 'All' ? null : customerName,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Trigger AI Processing
      toast.loading("AI is indexing document for RAG...", { id: toastId });
      await invokeEdgeFunction('process-knowledge-document', {
        body: { documentId: doc.id }
      });

      toast.success("Document indexed successfully!", { id: toastId });
      onSuccess();
      onClose();
      // Reset state
      setFile(null);
      setDocName("");
      setCustomerName("All");
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] rounded-[24px] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Upload Knowledge</DialogTitle>
          <DialogDescription className="font-medium">
            Add a document to the Support Brain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Document Name</Label>
            <Input 
              placeholder="e.g., Q3 Release Notes" 
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="h-11 rounded-xl bg-gray-50 dark:bg-gray-900 border-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Customer Context</Label>
            <Select value={customerName} onValueChange={setCustomerName}>
              <SelectTrigger className="h-11 rounded-xl bg-gray-50 dark:bg-gray-900 border-none">
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl">
                <SelectItem value="All" className="font-bold text-indigo-600">Global (Product Wide)</SelectItem>
                {uniqueCustomers.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">File</Label>
            {!file ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-32 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-all group"
              >
                <Upload className="h-6 w-6 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
                <span className="text-xs font-bold text-muted-foreground">Click to select file (.pdf, .txt, .xlsx)</span>
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.txt,.xlsx,.xls,.md" />
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm font-bold truncate max-w-[200px]">{file.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancel</Button>
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || !file || !docName}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-lg shadow-indigo-500/20"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            Start Indexing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentModal;