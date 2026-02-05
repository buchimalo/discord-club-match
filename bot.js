const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    ws: { 
        properties: { 
            browser: 'discord.js',
            device: 'discord.js'
        },
        compress: false,
        large_threshold: 50
    },
    rest: { 
        timeout: 60000,
        retries: 3,
        restTimeOffset: 0
    }
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;

console.log('🔍 ENHANCED TEST - Starting...');
console.log(`🔍 Node.js version: ${process.version}`);
console.log(`🔍 Token available: ${TOKEN ? 'YES' : 'NO'}`);
console.log(`🔍 Token length: ${TOKEN ? TOKEN.length : 'undefined'}`);

client.on('ready', () => {
    console.log('✅ SUCCESS: Enhanced test passed!');
    console.log(`✅ Bot online as: ${client.user.tag}`);
    console.log(`✅ Servers: ${client.guilds.cache.size}`);
});

client.on('error', (error) => {
    console.error('❌ Client error:', error);
});

client.on('debug', (info) => {
    if (info.includes('Heartbeat') || info.includes('Session')) {
        console.log('🔧 Connection:', info);
    }
});

client.on('warn', (warning) => {
    console.warn('⚠️ Warning:', warning);
});

client.on('shardError', (error) => {
    console.error('❌ Shard error:', error);
});

client.on('shardReconnecting', () => {
    console.log('🔄 Shard reconnecting...');
});

// より長いタイムアウト設定
const timeout = setTimeout(() => {
    console.error('⏰ Login timeout after 60 seconds');
}, 60000);

console.log('🔐 Attempting enhanced Discord login...');
client.login(TOKEN)
    .then(() => {
        console.log('🔐 Enhanced login command sent successfully');
        clearTimeout(timeout);
    })
    .catch(error => {
        console.error('❌ Enhanced login failed immediately:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error code:', error.code || 'No code');
        clearTimeout(timeout);
    });

// Express server
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.json({ 
        status: 'enhanced-testing',
        timestamp: new Date().toISOString(),
        ready: client.readyAt ? true : false,
        uptime: process.uptime()
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: client.readyAt ? 'online' : 'offline',
        ping: client.ws.ping,
        guilds: client.guilds.cache.size
    });
});

app.listen(port, () => {
    console.log(`🚀 Enhanced server running on port ${port}`);
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

console.log('📋 Enhanced test setup complete');
