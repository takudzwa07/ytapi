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
