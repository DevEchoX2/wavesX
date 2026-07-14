const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

const accountsCred = process.env.ACCOUNTS_SERVICE_ACCOUNT ? JSON.parse(process.env.ACCOUNTS_SERVICE_ACCOUNT) : null;
const chatCred = process.env.CHAT_SERVICE_ACCOUNT ? JSON.parse(process.env.CHAT_SERVICE_ACCOUNT) : null;

if (!accountsCred || !chatCred) {
  console.error('Missing service account credentials. Set ACCOUNTS_SERVICE_ACCOUNT and CHAT_SERVICE_ACCOUNT environment variables with JSON content.');
}

let accountsApp;
let chatApp;
try {
  accountsApp = admin.initializeApp({ credential: admin.credential.cert(accountsCred) }, 'accountsApp');
  chatApp = admin.initializeApp({ credential: admin.credential.cert(chatCred) }, 'chatApp');
} catch (e) {
  console.error('Error initializing admin apps', e);
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.post('/token-exchange', async (req, res) => {
  const idToken = req.body && req.body.idToken;
  if (!idToken) return res.status(400).json({ error: 'missing idToken' });
  try {
    const decoded = await accountsApp.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const customToken = await chatApp.auth().createCustomToken(uid);
    return res.json({ customToken });
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

exports.api = functions.https.onRequest(app);
