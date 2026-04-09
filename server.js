const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ── AI PROXY ENDPOINT ──────────────────────────────
app.post('/api/claude', async (req, res) => {
  try {
    const { message, system } = req.body;
    if (!ANTHROPIC_API_KEY) {
      return res.json({ error: 'API Key no configurada en el servidor' });
    }
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: system || 'Eres un experto en marketing digital.',
        messages: [{ role: 'user', content: message }]
      })
    });
    const data = await response.json();
    const reply = data.content && data.content[0] ? data.content[0].text : 'Sin respuesta';
    res.json({ reply });
  } catch (err) {
    console.error('Claude API error:', err);
    res.json({ error: 'Error al conectar con Claude: ' + err.message });
  }
});

// ── META ADS PROXY ─────────────────────────────────
app.get('/api/meta', async (req, res) => {
  try {
    const { accountId, token, fields, datePreset } = req.query;
    const url = `https://graph.facebook.com/v18.0/${accountId}/insights?fields=${fields}&date_preset=${datePreset || 'last_month'}&access_token=${token}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ── SERVE DASHBOARD ────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Avantex Dashboard corriendo en puerto ${PORT}`);
});
