/**
 * User API service for Moon Pixel Map
 */

/**
 * User data interface
 */
export interface UserData {
  id?: number | null; // Allow null for id as per backend response
  address: string;
  ensName?: string | null;
  firstConnected?: string | null;
  lastConnected?: string | null;
  owned_pixels?: number; // Changed from ownedPixels to owned_pixels
}

/**
 * Save or update user data in the backend
 * @param userData The user data object containing address, ENS name, etc.
 * @returns Promise with the saved user data
 */
export async function saveUserData(userData: Partial<UserData>): Promise<UserData> {
  try {
    // Use relative URL for better compatibility
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to save user data: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
}

/**
 * Fetch user data from the backend by Ethereum address
 * @param address The Ethereum address of the user
 * @returns Promise with the user data
 */
export async function fetchUserData(address: string): Promise<UserData | null> {
  if (!address) return null;

  try {
    // Use relative URL and include the address in the path
    const response = await fetch(`/api/users/${address}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // User not found, which is a valid case (e.g., new user)
        return null;
      }
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      throw new Error(errorData.error || `Failed to fetch user data: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    // It might be better to return null or a specific error object
    // instead of re-throwing, depending on how the caller handles it.
    // For now, re-throwing to maintain previous behavior pattern.
    throw error;
  }
}
