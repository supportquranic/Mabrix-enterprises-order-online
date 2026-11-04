// Vercel Serverless Function: /api/orders
// Multi-Tier Persistent Store: MongoDB Atlas (Primary) + Cloud Key-Value + /tmp Scratchpad + In-Memory Cache

import fs from 'fs';
import path from 'path';
import os from 'os';
import dns from 'dns';

// Reliable DNS resolvers for SRV records across all network environments
try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch(e) {}

const CLOUD_ORDERS_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1a12ebed11e0c';
const TMP_ORDERS_FILE = path.join(os.tmpdir(), 'mabrix_orders.json');
const DEFAULT_MONGODB_URI = 'mongodb+srv://mateen836osb_db_user:gBSYR6QBilTZvaHy@mabrix.jqy9ejq.mongodb.net/mabrix?retryWrites=true&w=majority';
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

let memoryOrders = null;
let cachedClient = null;
let cachedDb = null;

async function getMongoDb() {
    if (!MONGODB_URI) return null;
    if (cachedDb) return cachedDb;

    try {
        const { MongoClient } = await import('mongodb');
        if (!cachedClient) {
            cachedClient = new MongoClient(MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 6000
            });
            await cachedClient.connect();
        }
        cachedDb = cachedClient.db('mabrix');
        return cachedDb;
    } catch (err) {
        return null;
    }
}

function mergeOrdersLists(...lists) {
    const map = new Map();
    for (const list of lists) {
        if (Array.isArray(list)) {
            for (const item of list) {
                if (item && item.id) {
                    if (!map.has(item.id)) {
                        map.set(item.id, item);
                    } else {
                        const existing = map.get(item.id);
                        map.set(item.id, { ...existing, ...item });
                    }
                }
            }
        }
    }
    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return merged;
}

async function fetchFromCloud() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(CLOUD_ORDERS_URL, { signal: controller.signal, cache: 'no-store' });
        clearTimeout(timeoutId);
        if (res.ok) {
            const json = await res.json();
            if (json && json.data && Array.isArray(json.data.orders)) {
                return json.data.orders;
            }
        }
    } catch (e) {}
    return null;
}

function readFromTmp() {
    try {
        if (fs.existsSync(TMP_ORDERS_FILE)) {
            const raw = fs.readFileSync(TMP_ORDERS_FILE, 'utf-8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (e) {}
    return [];
}

function writeToTmp(orders) {
    try {
        fs.writeFileSync(TMP_ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    } catch (e) {}
}

async function pushToCloudWithRetry(orders) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        await fetch(CLOUD_ORDERS_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'mabrix_orders', data: { orders: orders } }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
    } catch (e) {}
}

async function getAllOrdersMerged() {
    // 1. Try MongoDB Atlas First
    const db = await getMongoDb();
    if (db) {
        try {
            const docs = await db.collection('orders').find({}).project({ _id: 0 }).sort({ createdAt: -1 }).toArray();
            if (Array.isArray(docs) && docs.length > 0) {
                memoryOrders = docs;
                writeToTmp(docs);
                return docs;
            }
        } catch (e) {}
    }

    // 2. Multi-tier Fallback (Cloud DB + /tmp + Memory)
    const cloudOrders = await fetchFromCloud();
    const tmpOrders = readFromTmp();
    const memOrders = Array.isArray(memoryOrders) ? memoryOrders : [];

    const all = mergeOrdersLists(cloudOrders || [], tmpOrders, memOrders);
    memoryOrders = all;
    writeToTmp(all);

    // If MongoDB is connected but was empty, populate it with existing orders
    if (db && all.length > 0) {
        try {
            const ops = all.map(o => ({
                updateOne: {
                    filter: { id: o.id },
                    update: { $set: o },
                    upsert: true
                }
            }));
            await db.collection('orders').bulkWrite(ops);
        } catch(e) {}
    }

    return all;
}

async function addAndSaveOrder(newOrder) {
    // 1. Save to MongoDB Atlas atomically (Orders & Customers directory)
    const db = await getMongoDb();
    if (db) {
        try {
            await db.collection('orders').updateOne(
                { id: newOrder.id },
                { $set: newOrder },
                { upsert: true }
            );

            if (newOrder.phone) {
                await db.collection('customers').updateOne(
                    { phone: newOrder.phone },
                    {
                        $set: {
                            name: newOrder.customerName,
                            phone: newOrder.phone,
                            area: newOrder.area,
                            address: newOrder.address,
                            lastCylinderType: newOrder.cylinderCode,
                            lastOrderedAt: newOrder.createdAt
                        },
                        $inc: { totalOrders: 1 },
                        $setOnInsert: { firstOrderedAt: newOrder.createdAt }
                    },
                    { upsert: true }
                );
            }
        } catch(e) {}
    }

    // 2. Multi-tier Cache & Backup
    const cloudOrders = await fetchFromCloud();
    const tmpOrders = readFromTmp();
    const memOrders = Array.isArray(memoryOrders) ? memoryOrders : [];

    const all = mergeOrdersLists(cloudOrders || [], tmpOrders, memOrders, [newOrder]);
    memoryOrders = all;
    writeToTmp(all);

    await pushToCloudWithRetry(all);
    return all;
}

async function updateOrderStatusInStore(id, status) {
    const updatedAt = new Date().toISOString();

    // 1. Update MongoDB Atlas
    const db = await getMongoDb();
    if (db) {
        try {
            await db.collection('orders').updateOne(
                { id },
                { $set: { status, updatedAt } }
            );
        } catch(e) {}
    }

    // 2. Update local cache & cloud backup
    const currentOrders = await getAllOrdersMerged();
    const orderIndex = currentOrders.findIndex(o => o.id === id);
    if (orderIndex !== -1) {
        currentOrders[orderIndex].status = status;
        currentOrders[orderIndex].updatedAt = updatedAt;
        memoryOrders = currentOrders;
        writeToTmp(currentOrders);
        await pushToCloudWithRetry(currentOrders);
        return currentOrders[orderIndex];
    }
    return null;
}

async function clearOrdersStore() {
    const db = await getMongoDb();
    if (db) {
        try {
            await db.collection('orders').deleteMany({});
        } catch(e) {}
    }
    memoryOrders = [];
    writeToTmp([]);
    await pushToCloudWithRetry([]);
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
        const orders = await getAllOrdersMerged();
        return res.status(200).json({
            success: true,
            count: orders.length,
            database: cachedDb ? 'mongodb' : 'fallback-store',
            orders: orders
        });
    }

    if (req.method === 'POST') {
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const newOrder = {
                id: body.id || 'MBX-' + Date.now().toString().slice(-6),
                customerName: body.customerName || 'Customer',
                phone: body.phone || '',
                area: body.area || 'Bahria Town',
                address: body.address || '',
                cylinderType: body.cylinderType || 'Domestic Cylinder (10 Kg)',
                cylinderCode: body.cylinderCode || 'domestic',
                quantity: Number(body.quantity) || 1,
                pricePerUnit: Number(body.pricePerUnit) || (body.cylinderCode === 'commercial' ? 10000 : 5000),
                totalPrice: Number(body.totalPrice) || ((Number(body.quantity) || 1) * (body.cylinderCode === 'commercial' ? 10000 : 5000)),
                deliveryTime: body.deliveryTime || 'As Soon As Possible',
                deliverySchedule: body.deliverySchedule || 'today',
                paymentMethod: body.paymentMethod || 'Cash on Delivery (COD)',
                status: body.status || 'pending',
                createdAt: body.createdAt || new Date().toISOString(),
                notes: body.notes || ''
            };

            await addAndSaveOrder(newOrder);

            return res.status(201).json({
                success: true,
                order: newOrder
            });
        } catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const { id, status } = body;
            const updated = await updateOrderStatusInStore(id, status);

            if (!updated) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            return res.status(200).json({
                success: true,
                order: updated
            });
        } catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            await clearOrdersStore();
            return res.status(200).json({ success: true, message: 'Orders cleared' });
        } catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
