/**
 * User API service for Moon Pixel Map
 */

/**
 * User data interface
 */
export interface UserData {
  id?: number;
  address: string;
  ensName?: string | null;
  firstConnected?: string | null;
  lastConnected?: string | null;
  ownedPixels?: number;
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
    // Determine the API URL (use backend directly or our API route)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/users/${address}`
      : `/api/users/${address}`;
      
    const response = await fetch(apiUrl);
    
    if (response.status === 404) {
      return null; // User not found
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch user data: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}
