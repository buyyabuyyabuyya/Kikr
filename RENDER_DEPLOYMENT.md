# Deploy to Render.com - Step by Step Guide

## Prerequisites
- GitHub account
- Discord bot token and client ID
- Git installed on your computer

---

## Step 1: Push Code to GitHub

1. **Initialize Git repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Charlie Kirk Discord bot"
   ```

2. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Name it: `kirk-discord-bot` (or any name you want)
   - Don't initialize with README (we already have files)
   - Click "Create repository"

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/kirk-discord-bot.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Get Discord Bot Credentials

If you don't have these yet:

1. Go to https://discord.com/developers/applications
2. Click "New Application" → Name it "Kirk Bot"
3. Go to **"Bot"** section:
   - Click "Reset Token" → Copy the token (this is your `DISCORD_TOKEN`)
   - Enable these intents:
     - ✅ Presence Intent
     - ✅ Server Members Intent
     - ✅ Message Content Intent
4. Go to **"OAuth2" → "General"**:
   - Copy the "Client ID" (this is your `DISCORD_CLIENT_ID`)
5. Go to **"OAuth2" → "URL Generator"**:
   - Scopes: Select `bot` and `applications.commands`
   - Bot Permissions: Select:
     - ✅ Send Messages
     - ✅ Attach Files
     - ✅ Use Slash Commands
   - Copy the generated URL and open it to invite bot to your server

---

## Step 3: Deploy to Render

1. **Go to Render**:
   - Visit https://render.com
   - Sign up with GitHub

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your `kirk-discord-bot` repository

3. **Configure the service**:
   - **Name**: `kirk-discord-bot` (or any name)
   - **Environment**: `Docker`
   - **Plan**: `Free`
   - **Branch**: `main`
   - Click "Advanced" to expand

4. **Add Environment Variables**:
   Click "Add Environment Variable" twice and add:
   
   | Key | Value |
   |-----|-------|
   | `DISCORD_TOKEN` | Your bot token from Discord Developer Portal |
   | `DISCORD_CLIENT_ID` | Your client ID from Discord Developer Portal |

5. **Click "Create Web Service"**

6. **Wait for deployment** (5-10 minutes):
   - Render will build your Docker image
   - Install all dependencies
   - Install Playwright browsers
   - Start your bot

---

## Step 4: Register Slash Commands

After the bot is deployed and running:

1. **Open Render Shell**:
   - In your Render dashboard, click on your service
   - Click "Shell" tab at the top
   - Wait for shell to connect

2. **Run command registration**:
   ```bash
   node register-commands.js
   ```

3. You should see:
   ```
   Started refreshing application (/) commands.
   Successfully reloaded application (/) commands.
   ```

**OR** register locally (if you prefer):
```bash
npm run register
```
(Make sure your `.env` file has the correct tokens)

---

## Step 5: Test Your Bot

1. Go to your Discord server
2. Type `/kirk` and you should see the command autocomplete
3. Upload an image
4. Wait 30-120 seconds for the face swap
5. Receive your Charlie Kirk transformation!

---

## Monitoring

### Check Bot Status
- In Render dashboard, go to your service
- Click "Logs" to see console output
- You should see: `✅ Logged in as [BotName]#1234!`

### If Bot Shows Offline
- Check logs in Render dashboard
- Verify environment variables are correct
- Make sure Discord bot token is valid

---

## Troubleshooting

### Bot doesn't appear online
**Solution**: Check Render logs for errors. Most common issues:
- Wrong `DISCORD_TOKEN` → Reset token in Discord Developer Portal
- Bot intents not enabled → Enable in Discord Developer Portal

### `/kirk` command doesn't appear
**Solution**: Run the register script again:
```bash
# In Render Shell or locally
node register-commands.js
```

### Face swap takes too long / times out
**Solution**: This is normal. Processing takes 30-120 seconds depending on queue. The bot will wait up to 2 minutes.

### "Out of memory" errors
**Solution**: Free tier has 512MB RAM. If issues persist:
- Upgrade to Starter plan ($7/month with more RAM)
- Or reduce concurrent operations

---

## Updating Your Bot

When you make code changes:

1. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update bot"
   git push
   ```

2. Render will automatically detect changes and redeploy (if auto-deploy is enabled)

---

## Cost

- **Free tier**: Includes 750 hours/month (enough for 24/7 operation)
- **After free hours**: Service will spin down until next month
- **Upgrade**: Starter plan ($7/month) for unlimited hours

---

## Support

If you encounter issues:
1. Check Render logs first
2. Verify Discord bot settings
3. Test the `/kirk` command in Discord
4. Check that `charlie-kirk-2025.jpg` is in your repository

Your bot should now be running 24/7 on Render! 🎉
