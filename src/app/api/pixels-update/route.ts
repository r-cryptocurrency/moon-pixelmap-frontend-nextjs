import { NextRequest, NextResponse } from 'next/server';

// Validate Ethereum address
function isValidEthereumAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Validate coordinates
function isValidCoordinate(coord: string | number) {
  const num = Number(coord);
  return !isNaN(num) && isFinite(num) && Number.isInteger(num);
}

export async function POST(request: NextRequest) {
  try {
    // Parse JSON from the request
    const body = await request.json();
    const { address, pixels } = body;

    // Validate inputs
    if (!address || !isValidEthereumAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid or missing Ethereum address' },
        { status: 400 }
      );
    }

    if (!pixels || !Array.isArray(pixels) || pixels.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing pixels data' },
        { status: 400 }
      );
    }

    // Validate all pixel coordinates and images
    for (const pixel of pixels) {
      if (!isValidCoordinate(pixel.x) || !isValidCoordinate(pixel.y)) {
        return NextResponse.json(
          { error: 'Invalid coordinates in pixels array' },
          { status: 400 }
        );
      }
      
      if (!pixel.image || typeof pixel.image !== 'string') {
        return NextResponse.json(
          { error: 'Image data is required for each pixel' },
          { status: 400 }
        );
      }
    }

    // Forward the request to our backend service
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4321';
    
    console.log('Forwarding to backend:', `${backendUrl}/api/pixels-update`);
    console.log('Request body:', { 
      address, 
      pixelCount: pixels.length, 
      avgImageLength: Math.round(pixels.reduce((sum: number, p: { image: string }) => sum + p.image.length, 0) / pixels.length)
    });
    
    const response = await fetch(`${backendUrl}/api/pixels-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        pixels,
      }),
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Backend returned non-JSON response:', text.substring(0, 500));
      return NextResponse.json(
        { error: 'Backend server error - non-JSON response' },
        { status: 500 }
      );
    }

    // Return the backend response
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to update pixel' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in pixels-update API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
