"use client";

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileUp, Download, Loader2, FileSpreadsheet } from 'lucide-react';
import { downloadTicketTemplate } from '@/utils/export';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CsvUploadAction = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Parsing and uploading tickets...");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const { data, errors } = results;
          
          if (errors.length > 0) {
            console.error("CSV Parsing Errors:", errors);
            toast.error("Error parsing CSV file.", { id: toastId });
            setIsUploading(false);
            return;
          }

          // Clean data: ensure dates are valid or null, and handle empty strings
          const cleanedData = data.map((row: any) => {
            const cleanRow = { ...row };
            ['created_at', 'updated_at', 'due_by', 'fr_due_by'].forEach(key => {
              if (!cleanRow[key] || cleanRow[key].trim() === '') {
                delete cleanRow[key];
              }
            });
            return cleanRow;
          });

          const { error } = await supabase
            .from('freshdesk_tickets')
            .upsert(cleanedData, { onConflict: 'freshdesk_id' });

          if (error) throw error;

          toast.success(`Successfully uploaded ${cleanedData.length} tickets!`, { id: toastId });
          queryClient.invalidateQueries({ queryKey: ['freshdeskTickets'] });
        } catch (err: any) {
          console.error("Upload Error:", err);
          toast.error(`Upload failed: ${err.message}`, { id: toastId });
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        toast.error(`File reading failed: ${error.message}`, { id: toastId });
        setIsUploading(false);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="rounded-xl border-none bg-white/50 dark:bg-gray-800/50 shadow-sm font-bold gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            CSV Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuLabel>Import/Export</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="cursor-pointer gap-2">
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            Upload CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadTicketTemplate} className="cursor-pointer gap-2">
            <Download className="h-4 w-4" />
            Download Template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CsvUploadAction;