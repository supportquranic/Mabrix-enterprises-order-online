// Vercel Serverless Function: /api/orders
// In-memory / persistent mock store for serverless environments

let ordersStore = [];

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            count: ordersStore.length,
            orders: ordersStore
        });
    }

    if (req.method === 'POST') {
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const newOrder = {
                id: body.id || 'MBX-' + Date.now().toString().slice(-6),
                customerName: body.customerName || 'Anonymous',
                phone: body.phone || '',
                area: body.area || 'Bahria Town',
                address: body.address || '',
                cylinderType: body.cylinderType || 'Domestic Cylinder (10 Kg)',
                cylinderCode: body.cylinderCode || 'domestic', // domestic or commercial
                quantity: Number(body.quantity) || 1,
                pricePerUnit: Number(body.pricePerUnit) || (body.cylinderCode === 'commercial' ? 12500 : 3000),
                totalPrice: Number(body.totalPrice) || ((Number(body.quantity) || 1) * (body.cylinderCode === 'commercial' ? 12500 : 3000)),
                deliveryTime: body.deliveryTime || 'As Soon As Possible', // 'As Soon As Possible' or 'Within 24 Hours'
                deliverySchedule: body.deliverySchedule || 'today', // 'today' or 'tomorrow'
                paymentMethod: body.paymentMethod || 'Cash on Delivery (COD)',
                status: body.status || 'pending', // 'pending', 'dispatched', 'delivered', 'cancelled'
                createdAt: body.createdAt || new Date().toISOString(),
                notes: body.notes || ''
            };

            ordersStore.unshift(newOrder);

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
            const orderIndex = ordersStore.findIndex(o => o.id === id);

            if (orderIndex === -1) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            ordersStore[orderIndex].status = status;
            ordersStore[orderIndex].updatedAt = new Date().toISOString();

            return res.status(200).json({
                success: true,
                order: ordersStore[orderIndex]
            });
        } catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
