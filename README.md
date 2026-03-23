# 🎮 GearSync

GearSync is a Next.js full-stack platform and Discord bot ecosystem designed for gamers to track, showcase, and compare their gaming setups and peripherals. 

## ✨ Features
- **Web Dashboard:** A sleek, dark-mode Next.js 16 interface to manage your setup (Mice, Keyboards, Audio, Monitors, etc.)
- **Automatic Image Fetching:** Automatically scans and fetches high-quality product images of your gear using a custom scraping engine.
- **Pro Player Directory:** Browse up-to-date setups, sensitivities, and hardware of top CS2 and Valorant Esports professionals (powered by automated `prosettings.net` scraping).
- **Dynamic Social Cards (Open Graph):** Share your public `gearsync.gg/u/username` profile anywhere (Discord, Twitter) and an automated image card will generate instantly showing off your stats and main gear!
- **Discord Bot Integration:** Users can query anyone's setup directly from Discord using intuitive slash commands (`/whichmouse`, `/whichkeyboard`, `/whichaudio`, etc).
- **Linked Accounts:** Connect and display your Steam profile and Valorant Rank (Tracker.gg) directly on your dashboard.

## 🛠️ Tech Stack
- **Frontend:** Next.js 16 (App Router), React, TailwindCSS
- **Backend:** Node.js, NextAuth.js (Discord OAuth)
- **Database:** MongoDB / Mongoose
- **Bot:** Discord.js v14
- **Scraping:** Custom Cheerio pipelines

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up your `.env.local` with your MongoDB URI, Discord Client Keys, and NextAuth Secret
4. Run the development server with `npm run dev`
5. Start the companion Discord bot from the `/gear-sync-bot` directory via `node index.js`
