/**
 * API service for Moon Pixel Map backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Fetch the pixel map image
 * @returns Promise with the image blob
 */
export async function fetchPixelMap(): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/pixelmap`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch pixel map: ${response.status} ${response.statusText}`);
  }
  
  return await response.blob();
}

/**
 * Fetch all pixels data
 * @returns Promise with the pixels data
 */
export async function fetchPixelsData(): Promise<Array<PixelData>> {
  const response = await fetch(`${API_BASE_URL}/api/pixels`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch pixels data: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Fetch data for a specific pixel
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Promise with the pixel data
 */
export async function fetchPixelData(x: number, y: number): Promise<PixelData> {
  const response = await fetch(`${API_BASE_URL}/api/pixels/${x}/${y}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch pixel data: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Update a pixel (requires authentication)
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param colorHex - Color in hex format (e.g. #FF0000)
 * @param userData - Additional user data to store with the pixel
 * @returns Promise with the updated pixel data
 */
export async function updatePixel(
  x: number, 
  y: number, 
  colorHex: string, 
  userData: Record<string, any>
): Promise<PixelData> {
  const response = await fetch(`${API_BASE_URL}/api/pixels/${x}/${y}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ color: colorHex, ...userData }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update pixel: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
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
