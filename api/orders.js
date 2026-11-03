// Vercel Serverless Function: /api/orders
// Multi-Tier Persistent Store: Cloud Key-Value DB + Local /tmp Scratchpad + In-Memory Cache

import fs from 'fs';
import path from 'path';
import os from 'os';

const CLOUD_ORDERS_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1a12ebed11e0c';
const TMP_ORDERS_FILE = path.join(os.tmpdir(), 'mabrix_orders.json');
let memoryOrders = null;

async function getOrdersFromCloud() {
    // 1. Try cloud store first
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2800);
        const res = await fetch(CLOUD_ORDERS_URL, { signal: controller.signal, cache: 'no-store' });
        clearTimeout(timeoutId);
        if (res.ok) {
            const json = await res.json();
            if (json && json.data && Array.isArray(json.data.orders)) {
                memoryOrders = json.data.orders;
                try { fs.writeFileSync(TMP_ORDERS_FILE, JSON.stringify(memoryOrders), 'utf-8'); } catch(e){}
                return memoryOrders;
            }
        }
    } catch(e){}

    // 2. Fallback to /tmp scratchpad
    try {
        if (fs.existsSync(TMP_ORDERS_FILE)) {
            const raw = fs.readFileSync(TMP_ORDERS_FILE, 'utf-8');
            memoryOrders = JSON.parse(raw);
            if (!Array.isArray(memoryOrders)) memoryOrders = [];
            return memoryOrders;
        }
    } catch(e){}

    // 3. Fallback to memory
    if (Array.isArray(memoryOrders)) return memoryOrders;

    return [];
}

async function saveOrdersToCloud(orders) {
    memoryOrders = orders;
    try {
        fs.writeFileSync(TMP_ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    } catch(e){}

    // Sync to cloud store
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        await fetch(CLOUD_ORDERS_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'mabrix_orders', data: { orders: orders } }),
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
        const currentOrders = await getOrdersFromCloud();
        return res.status(200).json({
            success: true,
            count: currentOrders.length,
            orders: currentOrders
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
                cylinderCode: body.cylinderCode || 'domestic', // domestic or commercial
                quantity: Number(body.quantity) || 1,
                pricePerUnit: Number(body.pricePerUnit) || (body.cylinderCode === 'commercial' ? 10000 : 5000),
                totalPrice: Number(body.totalPrice) || ((Number(body.quantity) || 1) * (body.cylinderCode === 'commercial' ? 10000 : 5000)),
                deliveryTime: body.deliveryTime || 'As Soon As Possible', // 'As Soon As Possible' or 'Within 24 Hours'
                deliverySchedule: body.deliverySchedule || 'today', // 'today' or 'tomorrow'
                paymentMethod: body.paymentMethod || 'Cash on Delivery (COD)',
                status: body.status || 'pending', // 'pending', 'dispatched', 'delivered', 'cancelled'
                createdAt: body.createdAt || new Date().toISOString(),
                notes: body.notes || ''
            };

            const currentOrders = await getOrdersFromCloud();
            if (!currentOrders.some(o => o.id === newOrder.id)) {
                currentOrders.unshift(newOrder);
            }
            await saveOrdersToCloud(currentOrders);

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
            const currentOrders = await getOrdersFromCloud();
            const orderIndex = currentOrders.findIndex(o => o.id === id);

            if (orderIndex === -1) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            currentOrders[orderIndex].status = status;
            currentOrders[orderIndex].updatedAt = new Date().toISOString();
            await saveOrdersToCloud(currentOrders);

            return res.status(200).json({
                success: true,
                order: currentOrders[orderIndex]
            });
        } catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
