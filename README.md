# Moon Pixel Map Frontend (Next.js)

This is the Next.js frontend for the Moon Pixel Map application. It allows users to view the pixel map, connect their wallets, see their owned pixels, and interact with a chat feature.

## Project Status

This project is currently under initial development.

## Tech Stack

*   Next.js (with App Router)
*   TypeScript
*   Tailwind CSS
*   ESLint
*   Reown AppKit + Wagmi + Viem (for wallet connection)
*   Socket.IO (for chat - to be added)

## Prerequisites

*   Node.js (version specified in `.nvmrc` or latest LTS)
*   npm or yarn

## Getting Started

1.  **Clone the repository (if not already done):**
    ```bash
    # git clone <repository-url>
    cd moon-pixelmap-frontend-nextjs
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file by copying the example (if one exists) or by adding the necessary variables:
    ```env
    # Backend API URL
    NEXT_PUBLIC_API_URL=http://localhost:4321
    
    # Get your project ID from https://cloud.reown.com/
    NEXT_PUBLIC_REOWN_PROJECT_ID=YOUR_PROJECT_ID
    
    # Contract address (must use NEXT_PUBLIC_ prefix for browser access)
    NEXT_PUBLIC_PIXEL_MAP_CONTRACT_ADDRESS=0x934095513c1ff89592A4b8490e263da7a6a4CEAc
    
    # Chain ID (42170 = Arbitrum Nova)
    NEXT_PUBLIC_CHAIN_ID=42170
    ```
    
    **Important Notes:**
    - All browser-accessible environment variables MUST use the `NEXT_PUBLIC_` prefix
    - Do NOT use quotes around values in `.env.local` files
    - Restart the dev server after changing environment variables

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

*   `dev`: Runs the app in development mode.
*   `build`: Builds the app for production.
*   `start`: Starts a production server.
*   `lint`: Lints the codebase.

## Project Structure

*   `src/app/`: Contains the main application pages and layouts (using Next.js App Router).
*   `src/components/`: Reusable UI components:
    - `PixelMapViewer.tsx`: Canvas-based pixel map with pan/zoom and multi-select
    - `UpdatePixelModal.tsx`: Modal for uploading images to single or multiple pixels
    - `PixelMapArea.tsx`: Container managing map interactions and modal state
    - `PixelInfoCard.tsx`: Displays information about selected pixels
    - `ChatDisplay.tsx`, `ChatInput.tsx`: Chat interface (UI only, not connected yet)
*   `src/context/`: React context providers (WalletContext, Web3Provider).
*   `src/hooks/`: Custom React hooks (e.g., `useUserPixels.ts`).
*   `src/services/`: API services and data fetching utilities.
*   `src/config/`: Configuration files (contract ABI, Web3Modal config).
*   `public/`: Static assets.

## Key Features

### Multi-Select Mode
Toggle between **Pan Mode** and **Multi-Select Mode** using the button in the top-left of the pixel map:
- **Pan Mode**: Click and drag to move around the map, scroll to zoom
- **Multi-Select Mode**: Click and drag to select a rectangular area of pixels
  - Visual overlay shows selection size
  - Ownership validation ensures you only update pixels you own
  - Upload one image that gets automatically split across selected pixels
  - "Clear Selection" button to reset

### Pixel Updates
- Single-click a pixel in Pan Mode to open the update modal
- Select multiple pixels in Multi-Select Mode for batch updates
- Upload images (automatically scaled to fit selection)
- Real-time preview before updating
- Transaction handling through connected wallet

## Backend API

This frontend interacts with the `moon-pixelmap-backend-pg` service. Ensure the backend is running and accessible.

*   Pixel Map Image: `[NEXT_PUBLIC_API_URL]/api/pixelmap`
*   Pixel Data (JSON): `[NEXT_PUBLIC_API_URL]/api/pixels`
*   User Data: `[NEXT_PUBLIC_API_URL]/api/users`
*   Pixel Updates: `[NEXT_PUBLIC_API_URL]/api/pixels-update`

## Contributing

Please refer to the main project's contributing guidelines.

## License

This project is licensed under the [Specify License Here].

# MOONPLACE PIXEL MAP FRONTEND (Next.js)

## Current Status (as of October 30, 2025)
✅ **Working Features:**
- Next.js 14 with App Router and TypeScript
- Wallet connection via Reown AppKit (Web3Modal v4) + Wagmi v2
- Interactive pixel map display with pan & zoom
- Multi-select mode for batch pixel updates
- Real-time pixel ownership highlighting
- Pixel info card with ownership details
- Update pixel modal with image upload
- Responsive layout with dark mode support

✅ **Recently Implemented:**
- **Multi-select feature** for updating multiple pixels at once:
  - Toggle between Pan Mode and Multi-Select Mode
  - Click and drag to select rectangular areas
  - Visual selection overlay with size labels
  - Automatic ownership validation for selected pixels
  - Batch image upload and processing
- Fixed modal transparency issue (solid background in dark mode)
- Environment variable configuration for contract address
- Proper Next.js environment variable naming (NEXT_PUBLIC_ prefix)

⚠️ **Known Issues:**
- Chat not connected to backend (UI only)
- No real-time WebSocket updates yet
- Performance could be optimized for very large selections
- Missing error boundaries
- Some TypeScript warnings in legacy components

## TODO Lists

### 🔴 Immediate (Critical):
1. ✅ ~~**Consolidate Web3 providers**~~ - COMPLETED (using Wagmi v2 + Reown AppKit)
2. **Add error boundaries** for graceful error handling
3. ✅ ~~**Configure environment variables**~~ - COMPLETED (NEXT_PUBLIC_* variables)
4. ✅ ~~**Fix modal transparency**~~ - COMPLETED (dark mode background fixed)
5. **Add loading states** for async operations
6. **Connect chat to Socket.IO backend**
7. ✅ ~~**Implement multi-select feature**~~ - COMPLETED (selection mode with batch updates)

### 🟡 Near Term (1-2 weeks):
1. ✅ ~~**Implement pixel selection and update**~~ - COMPLETED:
   - ✅ Modal for image upload with preview
   - ✅ Multi-pixel selection mode
   - ✅ Transaction handling via Wagmi
   - ✅ Ownership validation
2. **Add user dashboard**:
   - Display owned pixels in a grid/list
   - Transaction history
   - Name registration UI
3. **Optimize performance**:
   - Virtual scrolling for large selections
   - Image lazy loading
   - Component memoization
4. **Implement real-time updates** via WebSocket:
   - Live pixel update notifications
   - Chat message streaming
5. **Add proper error handling** and user feedback:
   - Toast notifications
   - Transaction status tracking
   - Better error messages
6. **Improve responsive design** for mobile:
   - Touch gestures for pan/zoom
   - Mobile-optimized selection
   - Responsive modal layout

### 🟢 Long Term (1+ month):
1. **Add advanced features**:
   - Zoom and pan controls
   - Pixel search
   - Filters and layers
2. **Implement social features**:
   - User profiles
   - Pixel favorites
   - Share functionality
3. **Add animations**:
   - Pixel update animations
   - History playback
4. **Create marketplace features**:
   - Pixel trading
   - Price history
5. **Add accessibility features** (ARIA, keyboard nav)
6. **Implement PWA features**
