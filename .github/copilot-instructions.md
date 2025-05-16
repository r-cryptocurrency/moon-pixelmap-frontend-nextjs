// filepath: /home/jw/src/moonplace/moon-pixelmap-frontend-nextjs/.github/copilot-instructions.md
# Copilot Instructions for moon-pixelmap-frontend-nextjs

## Project Overview

This project is a Next.js frontend for the Moon Pixel Map application. It will interact with the `moon-pixelmap-backend-pg` to display the pixel map, allow users to connect their wallets, view their owned pixels, and use a chat feature.

## Key Technologies

*   Next.js (App Router)
*   TypeScript
*   Tailwind CSS
*   Ethers.js (or similar for wallet interaction)
*   Socket.IO (for chat, potentially)

## Development Goals

1.  **Display Pixel Map**: Fetch and render the pixel map image from the backend.
2.  **Wallet Integration**: Allow users to connect Ethereum wallets (e.g., MetaMask).
3.  **User Status**: Show wallet connection status, blockchain information, and pixels owned by the user.
4.  **Pixel Interaction**: Allow users to update pixel tiles they own (requires backend API).
5.  **Chat Feature**: Implement a real-time chat, potentially with message history.
6.  **Responsive Design**: Ensure the application is usable on various screen sizes.

## Backend API Endpoints (from `moon-pixelmap-backend-pg`)

*   `/api/pixelmap`: Serves the PNG image of the pixel map.
*   `/api/pixels`: Serves JSON data of all pixels.
*   (Potential future endpoints for updating pixels, user authentication, chat messages)

## Initial Setup Tasks (Done)
- Project scaffolded with Next.js, TypeScript, Tailwind CSS, ESLint.

## Next Steps / Pending Tasks
- Update `README.md`.
- Create `tasks.json` for build/run scripts.
- Implement basic layout (header, main content area, footer).
- Implement pixel map display.
- Implement wallet connection.
- Implement status panel.
- Implement chat interface.
- Implement pixel update functionality.

## Coding Style and Preferences
- Follow Next.js best practices.
- Use TypeScript for all new code.
- Utilize Tailwind CSS for styling.
- Write clear and concise component names and props.
- Add JSDoc comments for complex functions and components.
