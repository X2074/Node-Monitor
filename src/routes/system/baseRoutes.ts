import express from 'express';
import { generateRSS } from '../../services/node/monitorRSSService';
const router = express.Router();

router.get('/', (req,
                 res) => {
    res.send('QNG Monitor!');
});

router.get('/rss', async (req, res) => {
    try {
        const rssFeed = await generateRSS();
        res.header('Content-Type', 'application/rss+xml');
        res.send(rssFeed);
    } catch (error) {
        console.error('Error generating RSS feed:', error);
        res.status(500).send('Error generating RSS feed');
    }
});

export default router;
