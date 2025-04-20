
---

📁 Project structure

ytmp3-api/
├── Dockerfile
├── index.js
├── package.json
├── .env.example
├── .gitignore
└── README.md


---

1. index.js

require('dotenv').config();
const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Health check
app.get('/', (_req, res) => {
  res.send('✅ YT→MP3 API is running.');
});

// Main endpoint
app.get('/ytmp3', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).json({ error: 'Invalid or missing `url` query parameter.' });
  }

  res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
  res.setHeader('Content-Type', 'audio/mpeg');

  try {
    const audioStream = ytdl(videoUrl, {
      quality: 'highestaudio',
      filter: 'audioonly',
    });

    ffmpeg(audioStream)
      .audioBitrate(192)
      .format('mp3')
      .on('error', err => {
        console.error('⚠️ FFmpeg error:', err);
        if (!res.headersSent) res.sendStatus(500);
      })
      .pipe(res, { end: true });

  } catch (err) {
    console.error('⚠️ Server error:', err);
    if (!res.headersSent) res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});


---

2. package.json

{
  "name": "ytmp3-api",
  "version": "1.0.0",
  "description": "YouTube→MP3 converter API",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "fluent-ffmpeg": "^2.3.0",
    "ytdl-core": "^4.11.1"
  }
}


---

3. .env.example

# Rename to ".env" and set your PORT if you like
PORT=3000


---

4. .gitignore

node_modules/
.env


---

5. Dockerfile

# Use Node.js + Alpine; add FFmpeg via apk
FROM node:18-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy and install deps
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy app code
COPY . .

# Expose port and define start command
ENV PORT=3000
EXPOSE ${PORT}
CMD ["npm", "start"]


---

6. README.md

# YT→MP3 API

A simple Express-based API that streams YouTube audio and converts it to MP3 on the fly.

## Endpoints

- **GET /**  
  Health check. Returns a simple “API is running” message.

- **GET /ytmp3?url={VIDEO_URL}**  
  Streams & converts the given YouTube video URL to MP3.  
  - **Query params**  
    - `url` (required): The full YouTube video URL.

Example:

```bash
curl -L "https://your-domain.com/ytmp3?url=https://youtu.be/dQw4w9WgXcQ" --output rick.mp3

Local development

1. Copy .env.example → .env and set any overrides.


2. npm install


3. npm start


4. Browse to http://localhost:3000/



Deploy on Render via Docker

1. Push this repo to GitHub.


2. In Render dashboard, create a new Web Service:

Environment: Docker

Dockerfile Path: ./Dockerfile

Build Command: (leave blank—Dockerfile handles it)

Start Command: (leave blank—Dockerfile’s CMD handles it)



3. Set any environment variables (e.g. PORT) under Environment.


4. Deploy! Your service will be available at https://<your-render-app>.onrender.com.




---

© 2025 Your Name — MIT License

---

Once you push all these files to a GitHub repo, simply point Render at it (using the Docker option) and you’ll have your `/ytmp3?url=…` API live in minutes. Let me know if you need help with any tweaks!

