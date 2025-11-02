# Moon Pixel Map Frontend (Next.js)

This is the Next.js frontend for the Moon Pixel Map application. It allows users to view the pixel map, connect their wallets, see their owned pixels, and interact with a chat feature.

## Project Status

This project is currently under initial development.

## Tech Stack

*   Next.js 14 (with App Router)
*   TypeScript
*   Tailwind CSS
*   ESLint
*   Reown AppKit + Wagmi v2 + Viem (for wallet connection)
*   WebSocket (native WebSocket API for real-time chat)

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
    
    # WebSocket URL for chat
    NEXT_PUBLIC_WS_URL=ws://localhost:4321/ws/chat
    
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
    - `PixelMapViewer.tsx`: Canvas-based pixel map with pan/zoom, multi-select, and ownership highlighting
    - `UpdatePixelPanel.tsx`: Unified update interface in sidebar for single/batch pixel updates
    - `PixelMapArea.tsx`: Container managing map interactions and mode switching
    - `PixelInfoCard.tsx`: Displays information about selected pixels
    - `StatusPanel.tsx`: Shows wallet connection status and owned pixel count
    - `ChatDisplay.tsx`: Real-time chat display with WebSocket connection
    - `ChatInput.tsx`: Chat input with WebSocket message sending
    - `Header.tsx`, `Footer.tsx`: Layout components
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
- Single-click a pixel in Pan Mode to open the update panel
- Select multiple pixels in Multi-Select Mode for batch updates
- Upload images (automatically scaled and split across selection)
- Real-time preview before updating
- Each pixel receives its own 10×10px portion of the uploaded image
- Transaction handling through connected wallet
- Map auto-refreshes after successful update (position preserved)
- Image preview clears automatically after upload

### Real-Time Chat
- WebSocket-based ephemeral trollbox
- Connect with or without wallet (anonymous mode)
- Last 50 messages visible as scrollback
- Rate limited to 3 messages per 5 seconds
- 500 character message limit
- Online user count display
- Your messages highlighted in green
- Auto-scroll to new messages

## Backend API

This frontend interacts with the `moon-pixelmap-backend-pg` service. Ensure the backend is running and accessible.

### REST Endpoints:
*   Pixel Map Image: `[NEXT_PUBLIC_API_URL]/api/pixelmap`
*   Pixel Data (JSON): `[NEXT_PUBLIC_API_URL]/api/pixels`
*   User Data: `[NEXT_PUBLIC_API_URL]/api/users`
*   Pixel Updates: `[NEXT_PUBLIC_API_URL]/api/pixels-update`
*   Status: `[NEXT_PUBLIC_API_URL]/api/status`

### WebSocket Endpoints:
*   Chat: `[NEXT_PUBLIC_WS_URL]` (typically `ws://localhost:4321/ws/chat`)

### Rate Limits:
*   General: 300 requests per 15 minutes
*   Write operations: 20 requests per 15 minutes
*   Chat: 3 messages per 5 seconds per IP

## Contributing

Please refer to the main project's contributing guidelines.

## License

This project is licensed under the [Specify License Here].

# MOONPLACE PIXEL MAP FRONTEND (Next.js)

## Current Status (as of October 31, 2025)
✅ **Working Features:**
- Next.js 14 with App Router and TypeScript
- Wallet connection via Reown AppKit (Web3Modal v4) + Wagmi v2
- Interactive pixel map display with pan & zoom
- Multi-select mode for batch pixel updates with intelligent image splitting
- Real-time pixel ownership highlighting
- Pixel info card with ownership details
- Unified update panel in sidebar (single/batch mode)
- **Real-time WebSocket chat** with ephemeral history
- Map auto-refresh after pixel updates (position preserved)
- Responsive layout with dark mode support

✅ **Recently Implemented (Oct 31, 2025):**
- **Real-time Chat System:**
  - WebSocket-based ephemeral trollbox
  - 50 message scrollback history
  - Rate limiting (3 msgs/5 seconds)
  - 500 character message limit
  - Anonymous or wallet-based posting
  - Online user count display
  - Auto-scroll to new messages
- **Intelligent Image Splitting:**
  - Uploads scaled canvas image instead of large original files
  - Automatically splits image across selected pixels (10×10px tiles per pixel)
  - Each pixel gets its own image portion
  - Optimized payload sizes (~2-5KB vs 5MB+)
- **UX Improvements:**
  - Consolidated update interface (removed duplicate modal)
  - Fixed button visibility issues
  - Improved font sizes for better readability
  - Map position preservation on refresh
  - Auto-clear uploaded image after successful update
- **Security Enhancements:**
  - SQL injection prevention with parameterized queries
  - Input validation middleware
  - Rate limiting (300 req/15min general, 20 req/15min writes)
  - Ownership validation for all pixel updates

⚠️ **Known Issues:**
- Occasional "Loading Web3 Providers..." hang (browser cache issue - needs hard refresh)
- Performance could be optimized for very large pixel selections
- Missing error boundaries
- Some TypeScript warnings in legacy components

## TODO Lists

### 🔴 Immediate (Critical):
1. ✅ ~~**Consolidate Web3 providers**~~ - COMPLETED
2. ✅ ~~**Configure environment variables**~~ - COMPLETED
3. ✅ ~~**Fix modal transparency**~~ - COMPLETED
4. ✅ ~~**Implement multi-select feature**~~ - COMPLETED
5. ✅ ~~**Connect chat to WebSocket backend**~~ - COMPLETED
6. ✅ ~~**Implement real-time map updates**~~ - COMPLETED
7. **Add error boundaries** for graceful error handling
8. **Add toast notifications** for better user feedback
9. **Fix browser cache issues** causing occasional hangs

### 🟡 Near Term (1-2 weeks):
1. ✅ ~~**Implement pixel selection and update**~~ - COMPLETED
2. **Enhance chat features**:
   - User mentions (@username)
   - Message reactions
   - Persistent scrollback (store in database)
   - Chat moderation tools
3. **Add user dashboard**:
   - Display owned pixels in a grid/list
   - Transaction history
   - Name registration UI
4. **Optimize performance**:
   - Virtual scrolling for large selections
   - Image lazy loading
   - Component memoization
   - Reduce re-renders
5. **Add proper error handling**:
   - Toast notifications
   - Transaction status tracking
   - Better error messages
   - Retry mechanisms
6. **Improve responsive design** for mobile:
   - Touch gestures for pan/zoom
   - Mobile-optimized selection
   - Responsive modal layout

### 🟢 Long Term (1+ month):
1. **Add advanced features**:
   - Pixel search and filtering
   - Pixel history viewer (time-lapse)
   - Layers and overlays
   - Color picker integration
2. **Implement social features**:
   - User profiles
   - Pixel favorites/bookmarks
   - Share functionality
   - Pixel ownership badges
3. **Add animations**:
   - Pixel update animations
   - History playback
   - Smooth transitions
4. **Create marketplace features**:
   - Pixel trading
   - Price history charts
   - Auction system
5. **Add accessibility features** (ARIA, keyboard nav)
6. **Implement PWA features** for offline support
