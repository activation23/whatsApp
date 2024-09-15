const qrcode = require('qrcode'); // Utilisation du module qrcode pour créer des images
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const express = require('express');
const path = require('path');

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

// Serve static files from the 'public' directory
app.use(express.static('public'));

client.on('qr', qr => {
  // Générer et enregistrer le QR code en format JPEG
  const filePath = `public/qrcode_${Date.now()}.jpeg`; // Le nom du fichier inclut un timestamp unique

  qrcode.toFile(filePath, qr, { type: 'jpeg' }, (err) => {
    if (err) console.error('Erreur lors de la génération du fichier JPEG du QR code:', err);
    else console.log(`QR code généré et enregistré sous ${filePath}`);
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

// Serve the page with QR code link
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
