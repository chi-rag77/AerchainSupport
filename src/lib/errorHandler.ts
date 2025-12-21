export class ApiError extends Error {
  status: number;
  details: any;

  constructor(message: string, status: number = 500, details: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    // Set prototype explicitly to ensure instanceof works correctly
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const status = error.response.status || 500;
    const message = error.response.data?.error || error.message || 'An unknown API error occurred.';
    return new ApiError(message, status, error.response.data);
  } 
  
  if (error.request) {
    // The request was made but no response was received
    return new ApiError('No response received from server.', 503, error.request);
  }
  
  // Something happened in setting up the request that triggered an Error
  return new ApiError(error.message || 'An unexpected error occurred.', 500, error);
};