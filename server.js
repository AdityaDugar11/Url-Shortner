const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Data Helpers ---
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// --- URL Validation ---
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// --- API Routes ---

// Create a shortened URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string' || url.trim() === '') {
    return res.status(400).json({ error: 'URL is required.' });
  }

  const trimmedUrl = url.trim();

  if (!isValidUrl(trimmedUrl)) {
    return res.status(400).json({ error: 'Please enter a valid URL starting with http:// or https://' });
  }

  const links = readData();

  // Check if URL already shortened
  const existing = links.find(l => l.originalUrl === trimmedUrl);
  if (existing) {
    return res.json({
      id: existing.id,
      originalUrl: existing.originalUrl,
      shortCode: existing.shortCode,
      shortUrl: `${req.protocol}://${req.get('host')}/${existing.shortCode}`,
      clicks: existing.clicks,
      createdAt: existing.createdAt
    });
  }

  const shortCode = nanoid(7);
  const newLink = {
    id: nanoid(12),
    originalUrl: trimmedUrl,
    shortCode,
    clicks: 0,
    createdAt: new Date().toISOString()
  };

  links.push(newLink);
  writeData(links);

  res.status(201).json({
    ...newLink,
    shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`
  });
});

// Get all links
app.get('/api/links', (req, res) => {
  const links = readData();
  const host = `${req.protocol}://${req.get('host')}`;
  const result = links.map(l => ({
    ...l,
    shortUrl: `${host}/${l.shortCode}`
  }));
  res.json(result.reverse()); // newest first
});

// Get single link stats
app.get('/api/links/:code', (req, res) => {
  const links = readData();
  const link = links.find(l => l.shortCode === req.params.code);
  if (!link) {
    return res.status(404).json({ error: 'Link not found.' });
  }
  res.json({
    ...link,
    shortUrl: `${req.protocol}://${req.get('host')}/${link.shortCode}`
  });
});

// --- Redirect Route ---
app.get('/:code', (req, res) => {
  const links = readData();
  const link = links.find(l => l.shortCode === req.params.code);

  if (!link) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }

  // Increment click count
  link.clicks += 1;
  writeData(links);

  // Send a visible redirect interstitial page
  const destination = link.originalUrl;
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta http-equiv="refresh" content="2;url=${destination}"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Redirecting... — Sniplink</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800&display=swap" rel="stylesheet"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:#0a0a0f;color:#f0f0f5;display:flex;align-items:center;justify-content:center;min-height:100vh;overflow:hidden}
    .orb{position:fixed;border-radius:50%;filter:blur(120px);opacity:.3;pointer-events:none}
    .orb1{width:400px;height:400px;background:radial-gradient(circle,#6366f1,transparent 70%);top:-100px;right:-50px;animation:f1 12s ease-in-out infinite}
    .orb2{width:300px;height:300px;background:radial-gradient(circle,#a855f7,transparent 70%);bottom:-80px;left:-50px;animation:f2 15s ease-in-out infinite}
    @keyframes f1{0%,100%{transform:translate(0,0)}50%{transform:translate(-30px,40px)}}
    @keyframes f2{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-30px)}}
    .card{position:relative;z-index:1;text-align:center;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:48px 40px;max-width:480px;width:90%;backdrop-filter:blur(20px);box-shadow:0 16px 64px rgba(0,0,0,.5)}
    .logo{font-size:1.3rem;font-weight:800;background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:32px}
    .spinner{width:48px;height:48px;border:3px solid rgba(255,255,255,.1);border-top:3px solid #6366f1;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 24px}
    @keyframes spin{to{transform:rotate(360deg)}}
    h1{font-size:1.5rem;font-weight:700;margin-bottom:12px}
    .dest{font-size:.85rem;color:#9ca3af;word-break:break-all;line-height:1.5;margin-bottom:24px;max-height:3em;overflow:hidden;text-overflow:ellipsis}
    .bar-track{width:100%;height:4px;background:rgba(255,255,255,.08);border-radius:100px;overflow:hidden;margin-bottom:20px}
    .bar-fill{height:100%;width:0;background:linear-gradient(90deg,#6366f1,#a855f7);border-radius:100px;animation:fill 2s ease-in-out forwards}
    @keyframes fill{to{width:100%}}
    .link{color:#6366f1;font-size:.85rem;text-decoration:none;font-weight:600;transition:color .2s}
    .link:hover{color:#a855f7}
  </style>
</head>
<body>
  <div class="orb orb1"></div>
  <div class="orb orb2"></div>
  <div class="card">
    <div class="logo">Sniplink</div>
    <div class="spinner"></div>
    <h1>Redirecting you…</h1>
    <p class="dest">${destination}</p>
    <div class="bar-track"><div class="bar-fill"></div></div>
    <a class="link" href="${destination}">Click here if not redirected</a>
  </div>
  <script>setTimeout(function(){window.location.href="${destination}"},2000)</script>
</body>
</html>`);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 URL Shortener running at http://localhost:${PORT}`);
});
