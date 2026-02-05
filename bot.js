const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const express = require('express');
const https = require('https');

// タイムゾーンの設定
const cronOptions = {
  timezone: "Asia/Tokyo"
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// 環境変数から設定を読み込み
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || 'YOUR_CHANNEL_ID';
const REMINDER_MESSAGE = '今日はクラブマッチの日です。忘れないためのリマインドです。通知をオンにしてボットさんの声を聞きましょう。repeat after me! 囲碁と将棋はちがうぞ！欧米しばくぞ！クラブマッチですよ！';
const APP_URL = process.env.RENDER_EXTERNAL_URL;
const TOKEN = process.env.DISCORD_BOT_TOKEN || 'YOUR_BOT_TOKEN';

// Discord接続状況を監視
let isDiscordReady = false;
let lastDiscordActivity = new Date();

// Discord接続イベント
client.on('ready', () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
    console.log(`✅ Connected to Discord at ${new Date().toISOString()}`);
    console.log(`✅ Bot is ready and serving ${client.guilds.cache.size} guilds`);
    isDiscordReady = true;
    lastDiscordActivity = new Date();
});

client.on('error', (error) => {
    console.error('❌ Discord client error:', error);
    isDiscordReady = false;
});

client.on('warn', (warning) => {
    console.warn('⚠️ Discord warning:', warning);
});

client.on('disconnect', () => {
    console.log('🔌 Discord disconnected');
    isDiscordReady = false;
});

client.on('reconnecting', () => {
    console.log('🔄 Discord reconnecting...');
    isDiscordReady = false;
});

// 10分ごとに自分自身にpingを送信 + Discord状況チェック
function keepAlive() {
    if (APP_URL) {
        setInterval(() => {
            // HTTP Pingチェック
            https.get(APP_URL, (resp) => {
                if (resp.statusCode === 200) {
                    console.log('Ping successful');
                } else {
                    console.log(`Ping returned status: ${resp.statusCode}`);
                }
            }).on('error', (err) => {
                console.log('❌ Ping failed:', err.message);
            });

            // Discord接続状況チェック
            console.log(`📊 Discord Status: ${isDiscordReady ? 'Connected' : 'Disconnected'}`);
            console.log(`📊 Last Activity: ${lastDiscordActivity.toISOString()}`);
            
            // メモリ使用量チェック（新機能）
            const memUsage = process.memoryUsage();
            const memUsageMB = {
                rss: Math.round(memUsage.rss / 1024 / 1024),
                heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
                external: Math.round(memUsage.external / 1024 / 1024)
            };
            console.log(`💾 Memory Usage: RSS=${memUsageMB.rss}MB, Heap=${memUsageMB.heapUsed}/${memUsageMB.heapTotal}MB`);
            
            // CPU使用時間チェック
            const cpuUsage = process.cpuUsage();
            console.log(`⚡ CPU Usage: User=${Math.round(cpuUsage.user/1000)}ms, System=${Math.round(cpuUsage.system/1000)}ms`);
            
            // 稼働時間
            const uptimeHours = Math.round(process.uptime() / 3600 * 100) / 100;
            console.log(`⏱️ Uptime: ${uptimeHours}h`);
            
            // 長時間非アクティブの場合は警告
            const timeSinceActivity = new Date() - lastDiscordActivity;
            if (timeSinceActivity > 30 * 60 * 1000) { // 30分
                console.warn('⚠️ Discord has been inactive for more than 30 minutes');
            }
        }, 5 * 60 * 1000); // 5分ごと
    }
}

// 火曜日・木曜日・土曜日の11時に実行
cron.schedule('0 11 * * 2,4,6', async () => {
    console.log('🔔 Attempting to send 11:00 reminder...');
    try {
        if (!isDiscordReady) {
            console.error('❌ Discord not ready, skipping 11:00 reminder');
            return;
        }
        
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('♠️♥️ クラブマッチ通知 - 11:00')
                .setDescription(REMINDER_MESSAGE)
                .setTimestamp();
            
            await channel.send({ embeds: [embed] });
            console.log('✅ 11:00の通知を送信しました');
            lastDiscordActivity = new Date();
        } else {
            console.error('❌ Channel not found for 11:00 reminder');
        }
    } catch (error) {
        console.error('❌ Error sending 11:00 reminder:', error);
    }
}, cronOptions);

// 火曜日・木曜日・土曜日の21時に実行
cron.schedule('0 21 * * 2,4,6', async () => {
    console.log('🔔 Attempting to send 21:00 reminder...');
    try {
        if (!isDiscordReady) {
            console.error('❌ Discord not ready, skipping 21:00 reminder');
            return;
        }
        
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('♠️♥️ クラブマッチ通知 - 21:00')
                .setDescription(REMINDER_MESSAGE)
                .setTimestamp();
            
            await channel.send({ embeds: [embed] });
            console.log('✅ 21:00の通知を送信しました');
            lastDiscordActivity = new Date();
        } else {
            console.error('❌ Channel not found for 21:00 reminder');
        }
    } catch (error) {
        console.error('❌ Error sending 21:00 reminder:', error);
    }
}, cronOptions);

// ボットのステータス確認用コマンド
client.on('messageCreate', async message => {
    lastDiscordActivity = new Date(); // メッセージ受信時にアクティビティ更新
    
    if (message.content === '!status') {
        const uptime = process.uptime();
        const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;
        
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🤖 リマインドボットの状態')
            .setDescription('正常に動作しています')
            .addFields(
                { name: '設定された時間', value: '火・木・土 11:00, 21:00' },
                { name: 'Discord接続状況', value: isDiscordReady ? '✅ 接続中' : '❌ 切断中' },
                { name: '稼働時間', value: uptimeFormatted },
                { name: '最後のアクティビティ', value: lastDiscordActivity.toISOString() },
                { name: 'リマインドメッセージ', value: REMINDER_MESSAGE }
            )
            .setTimestamp();
        
        try {
            await message.reply({ embeds: [embed] });
            console.log('📊 Status command executed successfully');
        } catch (error) {
            console.error('❌ Error replying to status command:', error);
        }
    }
});

// Express設定
const port = process.env.PORT || 10000;
const app = express();

app.get('/', (req, res) => {
    const statusInfo = {
        status: 'running',
        discordReady: isDiscordReady,
        uptime: process.uptime(),
        lastActivity: lastDiscordActivity,
        timestamp: new Date().toISOString()
    };
    
    res.json(statusInfo);
    console.log('📊 Health check requested');
});

app.get('/health', (req, res) => {
    const memUsage = process.memoryUsage();
    const healthData = {
        status: isDiscordReady ? 'healthy' : 'unhealthy',
        discord: isDiscordReady ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        memory: {
            rss: Math.round(memUsage.rss / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024)
        },
        lastActivity: lastDiscordActivity
    };
    
    if (isDiscordReady) {
        res.status(200).json(healthData);
    } else {
        res.status(503).json(healthData);
    }
});

// サーバー起動とDiscord接続
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`🚀 Starting Discord bot...`);
    
    // Discord接続をサーバー起動後に実行
    client.login(TOKEN)
        .then(() => {
            console.log('🔐 Bot login initiated');
            keepAlive(); // 接続成功後にkeepAlive開始
        })
        .catch(error => {
            console.error('❌ Failed to login to Discord:', error);
            console.error('❌ Error details:', error.message);
            // プロセスを終了させずに継続（デバッグ用）
        });
});

// プロセス終了時の処理
process.on('SIGINT', () => {
    console.log('📴 Received SIGINT, shutting down gracefully');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('📴 Received SIGTERM, shutting down gracefully');
    client.destroy();
    process.exit(0);
});
