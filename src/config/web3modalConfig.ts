// This file should only export truly static, SSR-safe constants.
import { mainnet, polygon, sepolia } from 'viem/chains'; // Ensure chains are imported

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'df1b891a13cb85a1964bcde7a4aba713'; // Fallback

if (!projectId) {
  console.error('❌ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set in .env.local. Please ensure this environment variable is correctly defined.');
} else {
  // console.log(`🔑 Using WalletConnect Project ID (from web3modalConfig.ts): ${projectId}`);
}

// Determine URL based on environment
const getAppUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'; // Common for local dev, ensure allowlisted in Reown Cloud
  }
  return 'https://moonplace.io'; // Your production URL
};

export const staticMetadata = {
  name: 'Moon Pixel Map',
  description: 'Connect your wallet to interact with the Moon Pixel Map',
  url: getAppUrl(), // Use dynamic URL
  icons: [`${getAppUrl()}/logo_w_text.png`] // Use dynamic URL for icon
};

export const chains = [mainnet, polygon, sepolia] as const;

// console.log('📦 web3modalConfig.ts loaded with metadata URL:', staticMetadata.url);
