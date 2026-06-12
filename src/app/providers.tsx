import { PropsWithChildren } from 'react';

// Moonplace is in permanent archive mode.
// No Wagmi / WalletConnect / Reown / chat websocket providers are mounted.
// This is a no-op passthrough so the app builds and renders fully static.
export function Providers({ children }: PropsWithChildren) {
  return <>{children}</>;
}
