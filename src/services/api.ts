/**
 * API service for Moon Pixel Map backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Fetch the pixel map image
 * @returns Promise with the image blob
 */
export async function fetchPixelMap(): Promise<Blob> {
  try {
    console.log('Fetching pixel map from:', `${API_BASE_URL}/api/pixelmap`);
    const response = await fetch(`${API_BASE_URL}/api/pixelmap`, {
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Accept': 'image/png, image/jpeg, image/svg+xml'
      }
    });
    
    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      throw new Error(`Failed to fetch pixel map: ${response.status} ${response.statusText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error in fetchPixelMap:', error);
    throw error;
  }
}

/**
 * Fetch all pixels data
 * @returns Promise with the pixels data
 */
export async function fetchPixelsData(): Promise<Array<PixelData>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pixels`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch pixels data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Map backend response format to our frontend format
    return data.map((pixel: any) => ({
      x: pixel.x,
      y: pixel.y,
      owner: pixel.current_owner || '',
      uri: pixel.uri || '',
      lastUpdated: pixel.timestamp || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching pixels data:', error);
    throw error;
  }
}

/**
 * Fetch data for a specific pixel
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Promise with the pixel data
 */
export async function fetchPixelData(x: number, y: number): Promise<PixelData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pixels/${x}/${y}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // Return empty pixel data for not found pixels
        return {
          x,
          y,
          owner: '',
        };
      }
      throw new Error(`Failed to fetch pixel data: ${response.status} ${response.statusText}`);
    }
    
    // Map backend response to our frontend format
    const data = await response.json();
    return {
      x: data.x,
      y: data.y,
      owner: data.current_owner || '',
      uri: data.uri || '',
      lastUpdated: data.timestamp || new Date().toISOString(),
      // If color isn't in response, could potentially extract it from URI if it's an SVG or other format
    };
  } catch (error) {
    console.error('Error fetching pixel data:', error);
    throw error;
  }
}

/**
 * Update a pixel owned by the user
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param address - Ethereum address of the owner
 * @param imageData - Image data (URI, base64, etc.)
 * @param metadata - Additional metadata for the pixel
 * @returns Promise with the updated pixel data
 */
export async function updatePixel(
  x: number, 
  y: number, 
  address: string,
  imageData: string,
  metadata?: Record<string, any>
): Promise<PixelData> {
  try {
    // Use the frontend API route which will validate and forward to backend
    const response = await fetch('/api/pixels-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        x,
        y,
        image: imageData,
        metadata
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update pixel: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Map to our PixelData format
    return {
      x: data.x,
      y: data.y,
      owner: data.owner || address,
      uri: data.uri || imageData,
      lastUpdated: data.timestamp || new Date().toISOString(),
      metadata: data.metadata || metadata
    };
  } catch (error) {
    console.error('Error updating pixel:', error);
    throw error;
  }
}

/**
 * Interface for pixel data
 */
export interface PixelData {
  x: number;
  y: number;
  owner: string;
  color?: string;
  lastUpdated?: string;
  uri?: string;
  metadata?: Record<string, any>;
}
