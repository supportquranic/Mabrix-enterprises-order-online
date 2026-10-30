// Vercel Serverless Function: /api/rates
// Persistent store with /tmp scratchpad and in-memory cache

import fs from 'fs';
import path from 'path';
import os from 'os';

const TMP_FILE = path.join(os.tmpdir(), 'mabrix_rates.json');

const DEFAULT_RATES = {
    domestic: 5000,
    commercial: 10000,
    isDefault: true,
    isCustom: false,
    updatedAt: "2026-01-01T00:00:00.000Z"
};

let memoryRates = null;

function getStoredRates() {
    if (memoryRates) return memoryRates;
    try {
        if (fs.existsSync(TMP_FILE)) {
            const raw = fs.readFileSync(TMP_FILE, 'utf-8');
            memoryRates = JSON.parse(raw);
            return memoryRates;
        }
    } catch(e){}
    return DEFAULT_RATES;
}

function saveStoredRates(rates) {
    memoryRates = rates;
    try {
        fs.writeFileSync(TMP_FILE, JSON.stringify(rates, null, 2), 'utf-8');
    } catch(e){}
}

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
            rates: getStoredRates()
        });
    }

    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const current = getStoredRates();
            const updated = {
                domestic: (body && body.domestic !== undefined) ? Number(body.domestic) : current.domestic,
                commercial: (body && body.commercial !== undefined) ? Number(body.commercial) : current.commercial,
                isDefault: false,
                isCustom: true,
                updatedAt: (body && body.updatedAt) 
                    ? (typeof body.updatedAt === 'number' ? new Date(body.updatedAt).toISOString() : body.updatedAt)
                    : new Date().toISOString()
            };

            saveStoredRates(updated);

            return res.status(200).json({
                success: true,
                rates: updated
            });
        } catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
