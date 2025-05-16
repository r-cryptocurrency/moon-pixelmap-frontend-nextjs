import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { fetchUserData } from '@/services/userApi';

export interface UserPixelsData {
  loading: boolean;
  error: string | null;
  ownedPixelsCount: number | null;
}

export function useUserPixels(): UserPixelsData {
  const { address, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ownedPixelsCount, setOwnedPixelsCount] = useState<number | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      // Reset if disconnected
      if (!isConnected || !address) {
        setOwnedPixelsCount(null);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const userData = await fetchUserData(address);
        
        if (userData) {
          setOwnedPixelsCount(userData.ownedPixels || 0);
        } else {
          // No user data yet, but that's fine
          setOwnedPixelsCount(0);
        }
      } catch (err) {
        console.error('Error loading user pixel data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load your pixel data');
        setOwnedPixelsCount(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [address, isConnected]);

  return { loading, error, ownedPixelsCount };
}
