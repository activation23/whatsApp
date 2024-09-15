const qrcode = require('qrcode'); // Utilisation du module qrcode pour créer des images
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // Pour envoyer les requêtes HTTP à Telegram

// Variables pour Telegram
const TELEGRAM_BOT_TOKEN = '7228703186:AAGWIxpeDP9vRgD8vjMY4octzwq9nDIDXkw'; // Remplace par le token de ton bot Telegram
const TELEGRAM_CHAT_ID = '6143012351'; // Remplace par ton ID de chat Telegram

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  },
  webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html' },
});

const app = express();
const port = 3000;

app.use(express.static('public'));

// Fonction pour envoyer le QR code à Telegram
async function sendQRToTelegram(filePath) {
  const formData = new FormData();
  formData.append('chat_id', TELEGRAM_CHAT_ID);
  formData.append('photo', fs.createReadStream(filePath));

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (result.ok) {
      console.log('QR code envoyé avec succès à Telegram');
    } else {
      console.error('Erreur lors de l\'envoi à Telegram:', result);
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi à Telegram:', error);
  }
}

client.on('qr', qr => {
  // Générer et enregistrer le QR code en format JPEG
  const filePath = `public/qrcode_${Date.now()}.jpeg`; // Le nom du fichier inclut un timestamp unique

  qrcode.toFile(filePath, qr, { type: 'jpeg' }, async (err) => {
    if (err) {
      console.error('Erreur lors de la génération du fichier JPEG du QR code:', err);
    } else {
      console.log(`QR code généré et enregistré sous ${filePath}`);
      // Envoyer le QR code à Telegram
      await sendQRToTelegram(filePath);
    }
  });
});

client.on('ready', () => {
  console.log('Client is ready!');
});

client.on('message', message => {
  if (message.body === '!ping') {
    client.sendMessage(message.from, 'Connecté avec succès');
  } else if (['Salut', 'salut', 'Slt', 'Bonjour'].includes(message.body)) {
    client.sendMessage(message.from, 'Bienvenue');
  }
});

client.initialize();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
