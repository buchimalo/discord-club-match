const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const express = require('express');

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
const REMINDER_MESSAGE = 'クラブマッチクビマッチクラブマッチクビマッチリマインドマッチンコマッチクラブマッチクビマッチ';

// 火曜日・木曜日・土曜日の11時に実行
cron.schedule('0 11 * * 2,4,6', async () => {
   try {
       const channel = await client.channels.fetch(CHANNEL_ID);
       if (channel) {
           const embed = new EmbedBuilder()
               .setColor('#FF0000')
               .setTitle('⚔️ クラブマッチ通知 - 11:00')
               .setDescription(REMINDER_MESSAGE)
               .setTimestamp();
           await channel.send({ embeds: [embed] });
           console.log('11:00の通知を送信しました');
       }
   } catch (error) {
       console.error('Error sending reminder:', error);
   }
}, cronOptions);

// 火曜日・木曜日・土曜日の21時に実行
cron.schedule('0 21 * * 2,4,6', async () => {
   try {
       const channel = await client.channels.fetch(CHANNEL_ID);
       if (channel) {
           const embed = new EmbedBuilder()
               .setColor('#FF0000')
               .setTitle('⚔️ クラブマッチ通知 - 21:00')
               .setDescription(REMINDER_MESSAGE)
               .setTimestamp();
           await channel.send({ embeds: [embed] });
           console.log('21:00の通知を送信しました');
       }
   } catch (error) {
       console.error('Error sending reminder:', error);
   }
}, cronOptions);

// ボットのステータス確認用コマンド
client.on('messageCreate', async message => {
   if (message.content === '!status') {
       const embed = new EmbedBuilder()
           .setColor('#00FF00')
           .setTitle('🤖 リマインドボットの状態')
           .setDescription('正常に動作しています')
           .addFields(
               { name: '設定された時間', value: '火・木・土 11:00, 21:00' },
               { name: 'リマインドメッセージ', value: REMINDER_MESSAGE }
           )
           .setTimestamp();
       message.reply({ embeds: [embed] });
   }
});

// ポート設定を追加
const port = process.env.PORT || 3000;
const app = express();
app.get('/', (req, res) => {
 res.send('Bot is running!');
});
app.listen(port, () => {
 console.log(`Server is running on port ${port}`);
});

// ボットのログイン
const TOKEN = process.env.DISCORD_BOT_TOKEN || 'YOUR_BOT_TOKEN';
client.login(TOKEN);
