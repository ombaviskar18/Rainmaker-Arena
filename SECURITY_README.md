# 🔒 Rainmaker Arena - Security & Setup Guide

## ⚠️ CRITICAL SECURITY NOTICE

**ALL SENSITIVE CREDENTIALS HAVE BEEN SECURED!** 🎉

This project now uses environment variables for all sensitive data. **No credentials are hardcoded** in the source code.

## 🚨 Security Features Implemented

✅ **Environment Variables**: All bot tokens, API keys secured  
✅ **Gitignore Protection**: `.env*` files excluded from version control  
✅ **Input Validation**: Required environment variables validated on startup  
✅ **Error Handling**: Graceful degradation when optional keys missing  
✅ **Template Files**: Secure templates with placeholder values only  

## 🛡️ Security Best Practices

### 1. Environment Variables
- **NEVER** commit `.env` files to git
- **ALWAYS** use placeholder values in templates
- **ROTATE** keys if accidentally exposed
- **USE** different credentials for development/production

### 2. API Key Security
- Keep CoinGecko API keys private
- Don't share Telegram bot tokens
- Use environment-specific credentials
- Monitor usage and rate limits

## 🚀 Quick Setup (Secure Method)

### Step 1: Clone & Install
```bash
git clone <your-repo>
cd Base_whale
npm install
```

### Step 2: Create Environment File
```bash
# Copy template to actual env file
cp env.template .env

# Or create manually
touch .env
```

### Step 3: Add Your Credentials
Edit `.env` file and replace placeholder values:

```env
# Required for Telegram Bot
TELEGRAM_BOT_TOKEN=your_actual_bot_token_here
TELEGRAM_CHAT_ID=your_actual_chat_id_here

# Required for Price Data  
COINGECKO_API_KEY=your_actual_coingecko_key_here

# Optional
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Step 4: Start the Bot
```bash
# Development
npm run dev

# Production (PM2)
npm run bot:start
```

## 🔑 Getting Your Credentials

### Telegram Bot Token
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Use `/newbot` command  
3. Follow setup instructions
4. Copy the bot token (format: `123456:ABC-DEF...`)

### Telegram Chat ID
1. Add your bot to a chat/channel
2. Send a message to the bot
3. Visit: `https://api.telegram.org/bot<YourBotToken>/getUpdates`
4. Find your chat ID in the response

### CoinGecko API Key (Free)
1. Visit [CoinGecko API](https://coingecko.com/en/api)
2. Sign up for free account
3. Generate API key
4. Use in environment file

## 📁 File Structure (Secured)

```
Base_whale/
├── .env                    # ⚠️ YOUR SECRETS (never commit!)
├── env.template           # ✅ Safe template file
├── .gitignore            # ✅ Protects .env files
├── scripts/
│   └── telegram-bot.js   # ✅ Secure bot (env vars)
├── src/lib/
│   ├── telegramGameBot.ts     # ✅ Secure (env vars)
│   └── realTimePriceService.ts # ✅ Secure (env vars)
└── ecosystem.config.js   # ✅ Secure PM2 config
```

## ✅ Security Validation

Run this checklist to ensure your setup is secure:

### Before Deployment
- [ ] `.env` file created with real credentials
- [ ] No hardcoded tokens in source code
- [ ] `.env` file in `.gitignore`
- [ ] Environment variables loading correctly
- [ ] Bot starts without errors
- [ ] Template files contain only placeholders

### After Deployment
- [ ] Bot connects successfully
- [ ] Price updates working
- [ ] No credentials visible in logs
- [ ] Environment variables not exposed
- [ ] .env file not in git history

## 🚨 Emergency Procedures

### If Credentials Are Exposed
1. **Immediately** regenerate all affected tokens/keys
2. Update environment files with new credentials
3. Restart all services
4. Check git history for exposed credentials
5. Consider force-pushing clean history if needed

### If Bot Stops Working
1. Check environment variables are set
2. Verify credentials are still valid
3. Check API rate limits
4. Review error logs in `./logs/`

## 🔧 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | ✅ Yes | Bot token from @BotFather | `123:ABC-DEF...` |
| `TELEGRAM_CHAT_ID` | ✅ Yes | Your chat/channel ID | `1234567890` |
| `COINGECKO_API_KEY` | ⚠️ Recommended | Free API key for price data | `CG-xxxxx...` |
| `NODE_ENV` | ⚠️ Optional | Environment mode | `production` |

## 💡 Pro Tips

1. **Use different bots** for development and production
2. **Set up monitoring** for API usage and costs
3. **Backup your `.env` file** securely (encrypted)
4. **Use PM2** for production deployment
5. **Monitor logs** regularly for security issues

## 🆘 Support

If you encounter security issues or need help:

1. **Check this README** first
2. **Verify environment setup**
3. **Check logs** in `./logs/` directory
4. **Ensure all credentials are valid**

---

## 🏆 You're All Set!

Your Rainmaker Arena bot is now **fully secured** and ready for production use! 

🎮 **Happy Gaming!** 🌧️⚡ 