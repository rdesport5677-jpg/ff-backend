const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.post('/api/telegram-alert', async (req, res) => {
  const { message } = req.body;
  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  if (!botToken || !chatId) {
    return res.status(500).json({ success: false, error: 'Bot token or Chat ID not configured on server' });
  }

  try {
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    if (data.ok) {
      res.json({ success: true, message: 'Telegram alert sent successfully' });
    } else {
      res.status(500).json({ success: false, error: data.description });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('FF Esports Backend is running live!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
