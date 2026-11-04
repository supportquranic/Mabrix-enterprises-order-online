// Vercel Serverless Function: /api/customer
// Cross-browser & cross-device regular customer lookup by phone number

import dns from 'dns';

try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch(e) {}

const DEFAULT_MONGODB_URI = 'mongodb+srv://mateen836osb_db_user:gBSYR6QBilTZvaHy@mabrix.jqy9ejq.mongodb.net/mabrix?retryWrites=true&w=majority';
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

let cachedClient = null;
let cachedDb = null;

async function getMongoDb() {
    if (!MONGODB_URI) return null;
    if (cachedDb) return cachedDb;

    try {
        const { MongoClient } = await import('mongodb');
        if (!cachedClient) {
            cachedClient = new MongoClient(MONGODB_URI, {
                serverSelectionTimeoutMS: 3000,
                connectTimeoutMS: 4000
            });
            await cachedClient.connect();
        }
        cachedDb = cachedClient.db('mabrix');
        return cachedDb;
    } catch (err) {
        return null;
    }
}

function normalizePhone(p) {
    if (!p) return '';
    let digits = String(p).replace(/[^0-9]/g, '');
    if (digits.startsWith('92')) digits = digits.slice(2);
    if (digits.startsWith('0')) digits = digits.slice(1);
    return digits;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    // List all regular customers for Admin Customer Directory
    if (req.query && (req.query.all === 'true' || req.query.list === 'true')) {
        try {
            const db = await getMongoDb();
            if (!db) {
                return res.status(200).json({ success: true, count: 0, customers: [] });
            }
            const customers = await db.collection('customers')
                .find({})
                .project({ _id: 0 })
                .sort({ lastOrderedAt: -1, totalOrders: -1 })
                .toArray();

            return res.status(200).json({
                success: true,
                count: customers.length,
                customers: customers
            });
        } catch (err) {
            return res.status(200).json({ success: false, count: 0, customers: [] });
        }
    }

    const rawPhone = (req.query && req.query.phone) || '';
    const clean = normalizePhone(rawPhone);

    if (!clean || clean.length < 9) {
        return res.status(200).json({ success: false, found: false });
    }

    try {
        const db = await getMongoDb();
        if (!db) {
            return res.status(200).json({ success: false, found: false });
        }

        const customer = await db.collection('customers').findOne({
            $or: [
                { cleanPhone: clean },
                { phone: rawPhone },
                { phone: { $regex: clean + '$' } }
            ]
        }, { projection: { _id: 0 } });

        if (customer) {
            return res.status(200).json({
                success: true,
                found: true,
                customer: {
                    name: customer.name || '',
                    phone: customer.phone || rawPhone,
                    area: customer.area || 'Bahria Town',
                    address: customer.address || '',
                    lastCylinderType: customer.lastCylinderType || 'domestic',
                    totalOrders: customer.totalOrders || 1
                }
            });
        }

        return res.status(200).json({ success: true, found: false });
    } catch (err) {
        return res.status(200).json({ success: false, found: false });
    }
}
