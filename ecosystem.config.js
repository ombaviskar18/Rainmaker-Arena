module.exports = {
  apps: [{
    name: 'rainmaker-telegram-bot',
    script: './scripts/telegram-bot.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '100M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    out_file: './logs/out.log',
    error_file: './logs/err.log',
    combine_logs: true,
    env: {
      NODE_ENV: 'production',
      // ⚠️  SECURITY: Load from .env file or system environment variables
      // NEVER commit real credentials to git!
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
      COINGECKO_API_KEY: process.env.COINGECKO_API_KEY
    }
  }]
}; 