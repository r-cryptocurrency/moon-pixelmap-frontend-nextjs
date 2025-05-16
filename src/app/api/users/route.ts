import { NextResponse } from 'next/server';

// Simple validation function for Ethereum addresses
function isValidEthereumAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { address, ensName, lastConnected } = body;

    // Validate the Ethereum address
    if (!address || !isValidEthereumAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    // Forward the request to our backend service
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4321';
    const response = await fetch(`${backendUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        ensName: ensName || null,
        lastConnected: lastConnected || new Date().toISOString(),
      }),
    });

    // Return the backend response
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to save user data' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in user API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
