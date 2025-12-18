# Moon Pixel Map Frontend (Next.js)

This is the Next.js frontend for the Moon Pixel Map application. It allows users to view the pixel map, connect their wallets, see their owned pixels, and interact with a real-time chat feature.

## Project Status

🚀 **Production Ready** (as of December 18, 2025)
- **Security Updated:** All dependencies updated to latest versions (Next.js 16, React 19) to resolve critical vulnerabilities.
- All core features implemented and tested
- Mobile-responsive design
- Full error handling with error boundaries
- Real-time chat with shared WebSocket connection
- Robust image validation and processing

## Tech Stack

*   Next.js 16.0.10 (with App Router)
*   React 19
*   TypeScript 5
*   Tailwind CSS 4.1.7
*   ESLint
*   Reown AppKit + Wagmi v2.15.3 + Viem (for wallet connection)
*   WebSocket (native API for real-time chat with auto-reconnect)
*   ethers.js v6.14.1 (blockchain interaction)

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

## Project Structure

*   `src/app/`: Contains the main application pages and layouts (using Next.js App Router).
    - `layout.tsx`: Root layout with SEO metadata and security headers
    - `page.tsx`: Home page with responsive grid layout (mobile-friendly)
    - `providers.tsx`: Web3 provider setup with ErrorBoundary and ChatWebSocketProvider
    - `api/`: API routes for backend integration
*   `src/components/`: Reusable UI components:
    - `PixelMapViewer.tsx`: Canvas-based pixel map with pan/zoom, multi-select, and ownership highlighting
    - `UpdatePixelPanel.tsx`: Unified update interface with image validation (5MB max, file type checking)
    - `PixelMapArea.tsx`: Container managing map interactions and mode switching
    - `PixelInfoCard.tsx`: Displays information about selected pixels
    - `StatusPanel.tsx`: Shows wallet connection status and owned pixel count
    - `ChatDisplay.tsx`: Real-time chat display using shared WebSocket context
    - `ChatInput.tsx`: Chat input with rate limit feedback
    - `ErrorBoundary.tsx`: React error boundary component for graceful error handling
    - `Header.tsx`, `Footer.tsx`: Layout components
*   `src/context/`: React context providers:
    - `ChatWebSocketContext.tsx`: Shared WebSocket connection with auto-reconnect and exponential backoff
    - `WalletContext.tsx`: Wallet connection state management
    - `Web3Provider.tsx`: Web3 provider setup
*   `src/hooks/`: Custom React hooks (e.g., `useUserPixels.ts`).
*   `src/services/`: API services and data fetching utilities with TypeScript interfaces.
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
- **Single shared WebSocket connection** (no duplicates)
- Automatic reconnection with exponential backoff (1s → 2s → 4s → max 30s)
- Connect with or without wallet (anonymous mode)
- Last 50 messages visible as scrollback
- Rate limited to 3 messages per 5 seconds
- 500 character message limit
- Online user count display
- Your messages highlighted in green
- Auto-scroll to new messages
- Visual connection status indicator
- Rate limit feedback with visual cues

## Backend API

This frontend interacts with the `moon-pixelmap-backend-pg` service. Ensure the backend is running and accessible.

### Recent Production Updates (December 10, 2025)

✅ **Chat & WebSocket Improvements:**
- Consolidated duplicate WebSocket connections into single shared context
- Implemented automatic reconnection with exponential backoff
- Added rate limit detection and user feedback
- Enhanced connection status indicators

✅ **Error Handling:**
- Added ErrorBoundary component to catch and handle React errors gracefully
- Prevents entire app from crashing on component errors
- Shows user-friendly error UI with retry functionality

✅ **Image Upload Validation:**
- File type validation (PNG, JPEG, GIF, WebP only)
- File size limit (5MB maximum)
- User-friendly error messages in upload panel
- Prevents invalid files from being sent to backend

✅ **Mobile Responsiveness:**
- Responsive grid layout (stacked on mobile, grid on desktop)
- Adaptive button sizing and text
- Proper Tailwind breakpoints (lg: prefix for desktop)
- 2-column layout for side panels on medium screens
- Better touch targets for mobile devices

✅ **Code Quality:**
- Removed all TypeScript `any` types - added proper interfaces
- Clean, production-ready code with no warnings
- Proper error handling throughout

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


## Production Deployment with Systemd

We recommend running the application using `systemd` with a dedicated user for better security and process management.

### 1. Create a Dedicated User
(If not already created for the backend)
```bash
sudo useradd -r -m -s /bin/false node-moonplace
```

### 2. Setup Application Code
Clone or move the repository to the user's home directory:
```bash
# Assuming code is currently in /home/jw/src/moonplace
sudo cp -r /home/jw/src/moonplace /home/node-moonplace/
sudo chown -R node-moonplace:node-moonplace /home/node-moonplace/moonplace
```

### 3. Install Dependencies and Build
Switch to the user (temporarily enabling shell if needed, or use sudo) to install dependencies and build the Next.js app:
```bash
sudo -u node-moonplace bash -c 'cd /home/node-moonplace/moonplace/moon-pixelmap-frontend-nextjs && npm install && npm run build'
```

### 4. Configure Systemd Service
Copy the provided service file to the systemd directory:
```bash
sudo cp /home/node-moonplace/moonplace/systemd/moon-pixelmap-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
```

### 5. Start and Enable Service
```bash
sudo systemctl start moon-pixelmap-frontend
sudo systemctl enable moon-pixelmap-frontend
```

### 6. View Logs
View logs using journalctl:
```bash
sudo journalctl -u moon-pixelmap-frontend -f
```
