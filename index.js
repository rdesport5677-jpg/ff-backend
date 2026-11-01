const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Lightweight Ping Endpoint (Cron-job ke liye, taaki data too big ka error na aaye)
app.get('/', (req, res) => {
    res.status(200).send("OK");
});

app.get('/ping', (req, res) => {
    res.status(200).send("PONG");
});

// 2. Secure Telegram Alert Endpoint
app.post('/api/telegram-alert', async (req, res) => {
    try {
        const { message } = req.body;
        const botToken = process.env.BOT_TOKEN;
        const chatId = process.env.CHAT_ID;

        if (!botToken || !chatId) {
            return res.status(500).json({ success: false, error: "Server env vars missing" });
        }

        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await axios.post(telegramUrl, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        });

        return res.status(200).json({ success: true, message: "Telegram alert sent" });
    } catch (error) {
        console.error("Telegram API Error:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Secure OneSignal Push Endpoint
app.post('/api/onesignal-push', async (req, res) => {
    try {
        const { title, message, url } = req.body;
        const appId = process.env.ONESIGNAL_APP_ID;
        const apiKey = process.env.ONESIGNAL_KEY;

        if (!appId || !apiKey) {
            return res.status(500).json({ success: false, error: "OneSignal env vars missing" });
        }

        const response = await axios.post(
            'https://onesignal.com/api/v1/notifications',
            {
                app_id: appId,
                contents: { en: message },
                headings: { en: title },
                url: url || undefined
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${apiKey}`
                }
            }
        );

        return res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        console.error("OneSignal API Error:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
