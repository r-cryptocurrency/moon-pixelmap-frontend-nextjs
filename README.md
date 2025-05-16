# Moon Pixel Map Frontend (Next.js)

This is the Next.js frontend for the Moon Pixel Map application. It allows users to view the pixel map, connect their wallets, see their owned pixels, and interact with a chat feature.

## Project Status

This project is currently under initial development.

## Tech Stack

*   Next.js (with App Router)
*   TypeScript
*   Tailwind CSS
*   ESLint
*   Web3Modal + wagmi + viem (for wallet connection)
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
    
    # Get your project ID from https://cloud.walletconnect.com/
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
    
    # Chain and contract information
    NEXT_PUBLIC_CHAIN_ID=1
    NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
    ```

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
*   `src/components/`: Reusable UI components.
*   `src/context/`: React context providers (WalletContext, Web3Provider).
*   `src/hooks/`: Custom React hooks.
*   `src/services/`: API services and data fetching utilities.
*   `public/`: Static assets.

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
