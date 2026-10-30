// Vercel Serverless Function: /api/rates
// Multi-Tier Persistent Store: Cloud Key-Value DB + Local /tmp Scratchpad + In-Memory Cache

import fs from 'fs';
import path from 'path';
import os from 'os';

const CLOUD_SYNC_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a18c462dec60f9';
const TMP_FILE = path.join(os.tmpdir(), 'mabrix_rates.json');

const DEFAULT_RATES = {
    domestic: 5000,
    commercial: 10000,
    isDefault: true,
    isCustom: false,
    updatedAt: "2026-01-01T00:00:00.000Z"
};

let memoryRates = null;

async function getStoredRates() {
    // 1. Try remote cloud sync first
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(CLOUD_SYNC_URL, { signal: controller.signal, cache: 'no-store' });
        clearTimeout(timeoutId);
        if (res.ok) {
            const json = await res.json();
            if (json && json.data && json.data.domestic && json.data.commercial) {
                memoryRates = {
                    domestic: Number(json.data.domestic),
                    commercial: Number(json.data.commercial),
                    isDefault: false,
                    isCustom: true,
                    updatedAt: json.data.updatedAt || new Date().toISOString()
                };
                try { fs.writeFileSync(TMP_FILE, JSON.stringify(memoryRates), 'utf-8'); } catch(e){}
                return memoryRates;
            }
        }
    } catch(e){}

    // 2. Fallback to memory
    if (memoryRates) return memoryRates;

    // 3. Fallback to /tmp file
    try {
        if (fs.existsSync(TMP_FILE)) {
            const raw = fs.readFileSync(TMP_FILE, 'utf-8');
            memoryRates = JSON.parse(raw);
            return memoryRates;
        }
    } catch(e){}

    return DEFAULT_RATES;
}

async function saveStoredRates(rates) {
    memoryRates = rates;
    try {
        fs.writeFileSync(TMP_FILE, JSON.stringify(rates, null, 2), 'utf-8');
    } catch(e){}

    // Sync to cloud store asynchronously
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        await fetch(CLOUD_SYNC_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'mabrix_rates', data: rates }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
    } catch(e){}
}

export default async function handler(req, res) {
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
        const current = await getStoredRates();
        return res.status(200).json({
            success: true,
            rates: current
        });
    }

    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const current = await getStoredRates();
            const updated = {
                domestic: (body && body.domestic !== undefined) ? Number(body.domestic) : current.domestic,
                commercial: (body && body.commercial !== undefined) ? Number(body.commercial) : current.commercial,
                isDefault: false,
                isCustom: true,
                updatedAt: (body && body.updatedAt) 
                    ? (typeof body.updatedAt === 'number' ? new Date(body.updatedAt).toISOString() : body.updatedAt)
                    : new Date().toISOString()
            };

            await saveStoredRates(updated);

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
