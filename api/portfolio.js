import { put, list } from '@vercel/blob';

const BLOB_PATH = 'portfolio/data.json';
const SECRET = process.env.PORTFOLIO_API_SECRET || 'myportfolio';

function json(res, data, status = 200) {
  res.setHeader('Content-Type', 'application/json');
  res.status(status).end(JSON.stringify(data));
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: 'portfolio/' });
      const blob = blobs.find((b) => b.pathname === BLOB_PATH);
      if (!blob) {
        res.status(404).end();
        return;
      }
      const response = await fetch(blob.url);
      const data = await response.json();
      json(res, data);
    } catch (err) {
      console.error('Portfolio GET error:', err);
      res.status(500).json({ error: 'Failed to load portfolio' });
    }
    return;
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const auth = req.headers.authorization;
    const token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!SECRET || token !== SECRET) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      await put(BLOB_PATH, JSON.stringify(body), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
        allowOverwrite: true,
      });
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Portfolio save error:', err);
      res.status(500).json({ error: 'Failed to save portfolio' });
    }
    return;
  }

  res.setHeader('Allow', 'GET, POST, PUT');
  res.status(405).end('Method Not Allowed');
}
