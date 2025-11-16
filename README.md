# Charlie Kirk Face Swap Discord Bot

A Discord bot that swaps faces with Charlie Kirk using the aifaceswap.io service.

## Features

- `/kirk` command - Upload an image and get it face-swapped with Charlie Kirk's face
- Automated browser interaction using Playwright
- Supports JPEG, PNG, and WebP images

## Setup

### Prerequisites

- Node.js 18.0.0 or higher
- A Discord Bot Token

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Discord credentials:
   - `DISCORD_TOKEN` - Your bot token from Discord Developer Portal
   - `DISCORD_CLIENT_ID` - Your application's client ID

### Getting Discord Credentials

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select an existing one
3. Go to the "Bot" section and create a bot
4. Copy the bot token (this is your `DISCORD_TOKEN`)
5. Go to "OAuth2" → "General" and copy the Client ID (this is your `DISCORD_CLIENT_ID`)
6. Invite the bot to your server using OAuth2 URL Generator:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Attach Files`, `Use Slash Commands`

### Register Commands

Before running the bot, register the slash commands:

```bash
npm run register
```

### Run the Bot

```bash
npm start
```

## Usage

In Discord, use the command:

```
/kirk image: [upload your image]
```

The bot will:
1. Download your image
2. Navigate to aifaceswap.io
3. Upload your image and Charlie Kirk's face
4. Process the face swap
5. Return the result

**Note:** Processing can take 30-120 seconds depending on the queue.

## File Structure

- `bot.js` - Main bot logic
- `faceswap.js` - Browser automation for face swapping
- `register-commands.js` - Registers slash commands with Discord
- `charlie-kirk-2025.jpg` - Charlie Kirk's face image
- `temp/` - Temporary storage for images (auto-created)

## Troubleshooting

### Bot doesn't respond
- Check that the bot is online in your Discord server
- Verify your `.env` credentials are correct
- Make sure you've run `npm run register` to register commands

### Face swap fails
- The aifaceswap.io service may be down or changed
- Check the console for error messages
- Ensure Playwright browsers are installed

### "Module not found" errors
- Run `npm install` again
- Make sure you're using Node.js 18+ (`node --version`)

## License

MIT
