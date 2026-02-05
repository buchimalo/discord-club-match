const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;

console.log('🔍 MINIMAL TEST - Starting...');
console.log(`🔍 Node.js version: ${process.version}`);
console.log(`🔍 Token available: ${TOKEN ? 'YES' : 'NO'}`);
console.log(`🔍 Token length: ${TOKEN ? TOKEN.length : 'undefined'}`);

client.on('ready', () => {
    console.log('✅ SUCCESS: Minimal test passed!');
    console.log(`✅ Bot online as: ${client.user.tag}`);
    console.log(`✅ Servers: ${client.guilds.cache.size}`);
});

client.on('error', (error) => {
    console.error('❌ Client error:', error);
});

client.on('debug', (info) => {
    console.log('🔧 Debug:', info);
});

client.on('warn', (warning) => {
    console.warn('⚠️ Warning:', warning);
});

// タイムアウト設定
const timeout = setTimeout(() => {
    console.error('⏰ Login timeout after 30 seconds');
}, 30000);

console.log('🔐 Attempting Discord login...');
client.login(TOKEN)
    .then(() => {
        console.log('🔐 Login command sent successfully');
        clearTimeout(timeout);
    })
    .catch(error => {
        console.error('❌ Login failed immediately:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error code:', error.code || 'No code');
        clearTimeout(timeout);
    });

// Express server for Render
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.json({ 
        status: 'testing',
        timestamp: new Date().toISOString(),
        ready: client.readyAt ? true : false
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: client.readyAt ? 'online' : 'offline',
        uptime: process.uptime()
    });
});

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});

// プロセス終了時の処理
process.on('SIGINT', () => {
    console.log('📴 Received SIGINT');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('📴 Received SIGTERM');
    client.destroy();
    process.exit(0);
});

console.log('📋 Minimal test setup complete');
