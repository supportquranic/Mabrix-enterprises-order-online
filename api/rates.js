// Vercel Serverless Function: /api/rates
// Persistent in-memory and configurable rates store

let currentRates = {
    domestic: 5000,
    commercial: 10000,
    updatedAt: new Date().toISOString()
};

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            rates: currentRates
        });
    }

    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            if (body) {
                if (body.domestic) currentRates.domestic = Number(body.domestic);
                if (body.commercial) currentRates.commercial = Number(body.commercial);
                currentRates.updatedAt = new Date().toISOString();
            }

            return res.status(200).json({
                success: true,
                rates: currentRates
            });
        } catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
