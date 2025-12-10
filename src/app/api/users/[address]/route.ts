import { NextRequest, NextResponse } from 'next/server';

// Validate Ethereum address format
const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!isValidEthereumAddress(address)) {
    return NextResponse.json({ error: 'Invalid Ethereum address format' }, { status: 400 });
  }

  try {
    // Forward the request to our backend service
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4321';
    const response = await fetch(`${backendUrl}/api/users/${address}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // If user not found in backend
    if (response.status === 404) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If there was some other error
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Error fetching user data' },
        { status: response.status }
      );
    }

    // Return the user data
    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error in GET /api/users/[address]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
