# Quick Start - Deploy in 5 Minutes

## What You Need
1. GitHub account
2. Discord bot token ([Get it here](https://discord.com/developers/applications))

---

## 5-Minute Deployment

### 1. Push to GitHub (1 min)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/kirk-bot.git
git push -u origin main
```

### 2. Deploy to Render (2 min)
1. Go to https://render.com (sign up with GitHub)
2. Click "New +" → "Web Service"
3. Select your repository
4. Set environment variables:
   - `DISCORD_TOKEN` = your Discord bot token
   - `DISCORD_CLIENT_ID` = your Discord client ID
5. Click "Create Web Service"

### 3. Register Commands (1 min)
Wait for deployment to finish, then in Render Shell:
```bash
node register-commands.js
```

### 4. Test (1 min)
In Discord: `/kirk` + upload image

---

## Need Help?
Read the full guide: `RENDER_DEPLOYMENT.md`
