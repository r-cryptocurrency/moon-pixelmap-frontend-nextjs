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
    // Parse the request body
    const body = await request.json();
    const { address, x, y, image, metadata } = body;

    // Validate inputs
    if (!address || !isValidEthereumAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid or missing Ethereum address' },
        { status: 400 }
      );
    }

    if (!isValidCoordinate(x) || !isValidCoordinate(y)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Forward the request to our backend service
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4321';
    const response = await fetch(`${backendUrl}/api/pixels-update/${x}/${y}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        image,
        metadata: metadata || null,
      }),
    });

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
