import { supabase } from '@/integrations/supabase/client';
import { ApiError } from './errorHandler';

// Base URL for Edge Functions (hardcoded project ID is required for client invocation)
const EDGE_FUNCTION_BASE_URL = `https://qwvdfewgilkbxtrdenhs.supabase.co/functions/v1`;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

/**
 * Generic client for invoking Supabase Edge Functions.
 * Handles authentication, JSON serialization, and error parsing.
 * 
 * @param functionName The name of the Edge Function (e.g., 'summarize-customer-tickets')
 * @param options Request options (method, body, headers, params)
 * @returns The parsed JSON response data
 */
export async function invokeEdgeFunction<T>(
  functionName: string,
  options: RequestOptions = {}
): Promise<T> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) {
    throw new ApiError("Authentication required to access this resource.", 401);
  }

  const url = `${EDGE_FUNCTION_BASE_URL}/${functionName}`;
  const method = options.method || 'POST';
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  let fullUrl = url;
  if (options.params) {
    const query = new URLSearchParams(options.params as Record<string, string>).toString();
    fullUrl = `${url}?${query}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: defaultHeaders,
  };

  if (options.body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(fullUrl, fetchOptions);

    if (!response.ok) {
      let errorData: any = { error: 'Unknown error' };
      try {
        errorData = await response.json();
      } catch {
        // If response is not JSON, use status text
        errorData.error = response.statusText;
      }
      
      const errorMessage = errorData.error || `Edge Function failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, errorData);
    }

    // Edge functions often return JSON data directly
    return await response.json() as T;

  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle network or parsing errors
    throw new ApiError(error.message || 'Network error during Edge Function invocation.', 500, error);
  }
}