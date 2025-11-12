
import { toast } from 'sonner';
import { signOut } from 'next-auth/react';

// A mapping of endpoint segments to user-friendly names.
const friendlyEndpointNames: { [key: string]: string } = {
  messages: 'message',
  'pending-users': 'pending user',
  'verify-user': 'user verification',
  invites: 'invite',
  'unverified-users': 'unverified user list',
  organization: 'organization details',
  account: 'account details',
  profile: 'profile',
  settings: 'settings',
};

// Function to get a more readable name for an endpoint.
function getFriendlyName(endpoint: string): string {
  const segment = endpoint.split('/').pop() || endpoint;
  return friendlyEndpointNames[segment] || 'item';
}

// Custom fetch wrapper
export const fetchApi = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, options);

  if (!res.ok) {
    if (res.status === 401) {
      // Session expired or invalid
      toast.error('Session expired. Please log in again.');
      // Redirect to login page after a short delay
      setTimeout(() => {
        signOut({ callbackUrl: '/login' });
      }, 2000);
    } else if (res.status === 403) {
      // Forbidden due to role limitations
      const friendlyName = getFriendlyName(url);
      toast.error(`You are not authorized to perform this action on the ${friendlyName}.`);
    } else {
      // Generic server error
      const friendlyName = getFriendlyName(url);
      toast.error(`Failed to perform action on ${friendlyName}. Please try again later.`);
    }
    
    // Throw an error to stop further processing in the calling function
    throw new Error(`API request failed with status ${res.status}`);
  }

  // If response is OK, parse and return the JSON.
  // Handle cases with no content.
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return res.json();
  }
  return; // Return undefined for non-json responses (e.g., 204 No Content)
};