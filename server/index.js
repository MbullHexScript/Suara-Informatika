import 'dotenv/config';
import express from 'express';
import reports from '../api/reports/index.js';
import detail from '../api/reports/[id].js';
import exportReports from '../api/reports/export.js';
import track from '../api/track/[id].js';
import upload from '../api/upload.js';
import webhook from '../api/telegram/webhook.js';
import retry from '../api/telegram/retry.js';
import stats from '../api/stats.js';
import health from '../api/health.js';

const app = express();
app.use(express.json({ limit: '64kb' }));
app.get('/api/health', health);
app.all('/api/reports/export', exportReports);
app.all('/api/reports/:id', detail);
app.all('/api/reports', reports);
app.all('/api/track/:id', track);
app.all('/api/upload', upload);
app.all('/api/telegram/webhook', webhook);
app.all('/api/telegram/retry', retry);
app.all('/api/stats', stats);
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  res.status(500).json({ error: 'Permintaan gagal diproses.' });
});
app.listen(process.env.PORT || 3001, () => console.log('API lokal siap di port ' + (process.env.PORT || 3001)));
