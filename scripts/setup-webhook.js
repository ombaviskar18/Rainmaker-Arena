const TELEGRAM_BOT_TOKEN = '8060135249:AAGPps8LWa1Ov6IrkmatFKSJ0XZZJSSdjYQ';

async function setupWebhook() {
  console.log('🔗 Setting up Telegram webhook for production...');
  
  const webhookUrl = 'https://whalehunter.vercel.app/api/telegram-webhook';
  
  try {
    // First, delete any existing webhook
    console.log('\n1. Clearing existing webhook...');
    const deleteResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`, {
      method: 'POST',
    });
    
    const deleteResult = await deleteResponse.json();
    console.log(deleteResult.ok ? '✅ Webhook cleared' : '⚠️ Webhook clear result:', deleteResult);
    
    // Set new webhook
    console.log('\n2. Setting new webhook...');
    const setResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true,
      }),
    });
    
    const setResult = await setResponse.json();
    
    if (setResult.ok) {
      console.log('✅ Webhook set successfully!');
      console.log(`   URL: ${webhookUrl}`);
    } else {
      console.log('❌ Failed to set webhook:', setResult);
      return;
    }
    
    // Verify webhook
    console.log('\n3. Verifying webhook...');
    const infoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
    const infoResult = await infoResponse.json();
    
    if (infoResult.ok) {
      console.log('✅ Webhook info:');
      console.log(`   URL: ${infoResult.result.url}`);
      console.log(`   Has custom certificate: ${infoResult.result.has_custom_certificate}`);
      console.log(`   Pending updates: ${infoResult.result.pending_update_count}`);
      console.log(`   Last error: ${infoResult.result.last_error_message || 'None'}`);
    }
    
    console.log('\n🎉 Webhook setup completed!');
    console.log('\n📱 Bot is ready for production:');
    console.log(`   Bot: https://t.me/Whale_alerting_bot`);
    console.log(`   Webhook: ${webhookUrl}`);
    console.log(`   Status: Production ready`);
    
  } catch (error) {
    console.error('❌ Error setting up webhook:', error);
  }
}

async function clearWebhook() {
  console.log('🧹 Clearing webhook for development...');
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`, {
      method: 'POST',
    });
    
    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Webhook cleared successfully!');
      console.log('   Bot is now in polling mode for development');
    } else {
      console.log('❌ Failed to clear webhook:', result);
    }
    
  } catch (error) {
    console.error('❌ Error clearing webhook:', error);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'set':
    setupWebhook();
    break;
  case 'clear':
    clearWebhook();
    break;
  default:
    console.log('🤖 Telegram Webhook Manager');
    console.log('');
    console.log('Usage:');
    console.log('  node setup-webhook.js set   - Set webhook for production');
    console.log('  node setup-webhook.js clear - Clear webhook for development');
    console.log('');
    console.log('Current bot: @Whale_alerting_bot');
    break;
} 