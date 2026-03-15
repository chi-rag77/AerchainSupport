"use client";

import { supabase } from '@/integrations/supabase/client';
import { ApiError } from './errorHandler';

/**
 * Generic client for invoking Supabase Edge Functions.
 * Uses the official Supabase SDK for better reliability and auth handling.
 */
export async function invokeEdgeFunction<T>(
  functionName: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean>;
  } = {}
): Promise<T> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      method: options.method || 'POST',
      body: options.body,
      headers: options.headers,
      queryParams: options.params as Record<string, string>,
    });

    if (error) {
      // Handle Supabase-specific function errors
      console.error(`Edge Function [${functionName}] Error:`, error);
      throw new ApiError(
        error.message || `Function ${functionName} failed`,
        error.status || 500,
        error
      );
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    
    console.error(`Unexpected error invoking [${functionName}]:`, err);
    throw new ApiError(
      err.message || 'Network error during Edge Function invocation.',
      500,
      err
    );
  }
}