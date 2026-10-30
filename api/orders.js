// Vercel Serverless Function: /api/orders
// In-memory / persistent mock store for serverless environments

const now = new Date();

let ordersStore = [
    {
        id: "MBX-882140",
        customerName: "Imran Khan",
        phone: "03001234567",
        area: "Bahria Town",
        address: "House 42, Sector C, Bahria Town Lahore",
        cylinderType: "Domestic Cylinder (10 Kg)",
        cylinderCode: "domestic",
        quantity: 1,
        pricePerUnit: 5000,
        totalPrice: 5000,
        deliveryTime: "As Soon As Possible",
        deliverySchedule: "today",
        paymentMethod: "Cash on Delivery (COD)",
        status: "pending",
        createdAt: new Date(now.getTime() - 20 * 60000).toISOString()
    },
    {
        id: "MBX-882139",
        customerName: "Tariq Mahmood (Cafe Royal)",
        phone: "03339876543",
        area: "Lake City",
        address: "Shop 12, Main Commercial Blvd, Lake City",
        cylinderType: "Commercial Cylinder (45 Kg)",
        cylinderCode: "commercial",
        quantity: 2,
        pricePerUnit: 10000,
        totalPrice: 20000,
        deliveryTime: "Within 24 Hours",
        deliverySchedule: "tomorrow",
        paymentMethod: "Bank Transfer (Askari Bank Ltd)",
        status: "pending",
        createdAt: new Date(now.getTime() - 55 * 60000).toISOString()
    },
    {
        id: "MBX-882138",
        customerName: "Dr. Naveed Ashraf",
        phone: "03014499011",
        area: "Valencia Town",
        address: "Plot 18, Block H, Valencia Town",
        cylinderType: "Commercial Cylinder (45 Kg)",
        cylinderCode: "commercial",
        quantity: 1,
        pricePerUnit: 10000,
        totalPrice: 10000,
        deliveryTime: "As Soon As Possible",
        deliverySchedule: "today",
        paymentMethod: "Cash on Delivery (COD)",
        status: "delivered",
        createdAt: new Date(now.getTime() - 110 * 60000).toISOString()
    },
    {
        id: "MBX-882137",
        customerName: "Zainab Fatima",
        phone: "03239988771",
        area: "Lake City",
        address: "House 77, Golf View, Lake City",
        cylinderType: "Domestic Cylinder (10 Kg)",
        cylinderCode: "domestic",
        quantity: 1,
        pricePerUnit: 5000,
        totalPrice: 5000,
        deliveryTime: "As Soon As Possible",
        deliverySchedule: "today",
        paymentMethod: "Cash on Delivery (COD)",
        status: "pending",
        createdAt: new Date(now.getTime() - 160 * 60000).toISOString()
    },
    {
        id: "MBX-882136",
        customerName: "Ayesha Bilal",
        phone: "03215554321",
        area: "Wapda Town",
        address: "House 18-B, Block E2, Wapda Town",
        cylinderType: "Domestic Cylinder (10 Kg)",
        cylinderCode: "domestic",
        quantity: 1,
        pricePerUnit: 5000,
        totalPrice: 5000,
        deliveryTime: "As Soon As Possible",
        deliverySchedule: "today",
        paymentMethod: "Cash on Delivery (COD)",
        status: "delivered",
        createdAt: new Date(now.getTime() - 280 * 60000).toISOString()
    },
    {
        id: "MBX-882135",
        customerName: "Malik Usman (Pizza Crust)",
        phone: "03028887766",
        area: "Khyaban-e-Amin",
        address: "Block N, Commercial Sector, Khyaban-e-Amin",
        cylinderType: "Commercial Cylinder (45 Kg)",
        cylinderCode: "commercial",
        quantity: 3,
        pricePerUnit: 10000,
        totalPrice: 30000,
        deliveryTime: "Within 24 Hours",
        deliverySchedule: "yesterday",
        paymentMethod: "Bank Transfer (Askari Bank Ltd)",
        status: "delivered",
        createdAt: new Date(now.getTime() - 26 * 3600000).toISOString()
    },
    {
        id: "MBX-882134",
        customerName: "Kashif Riaz",
        phone: "03451122334",
        area: "Bahria Town",
        address: "Villa 104, Jasmine Block, Bahria Town",
        cylinderType: "Domestic Cylinder (10 Kg)",
        cylinderCode: "domestic",
        quantity: 2,
        pricePerUnit: 5000,
        totalPrice: 10000,
        deliveryTime: "As Soon As Possible",
        deliverySchedule: "yesterday",
        paymentMethod: "Cash on Delivery (COD)",
        status: "delivered",
        createdAt: new Date(now.getTime() - 32 * 3600000).toISOString()
    },
    {
        id: "MBX-882133",
        customerName: "Haji Abdul Rehman",
        phone: "03006655443",
        area: "Wapda Town",
        address: "Shop 5, Main Grid Road, Wapda Town",
        cylinderType: "Commercial Cylinder (45 Kg)",
        cylinderCode: "commercial",
        quantity: 2,
        pricePerUnit: 10000,
        totalPrice: 20000,
        deliveryTime: "Within 24 Hours",
        deliverySchedule: "2 days ago",
        paymentMethod: "Bank Transfer (Askari Bank Ltd)",
        status: "delivered",
        createdAt: new Date(now.getTime() - 52 * 3600000).toISOString()
    },
    {
        id: "MBX-882132",
        customerName: "Zubair Ahmed",
        phone: "03314455667",
        area: "Valencia Town",
        address: "House 12-A, Block K, Valencia Town",
        cylinderType: "Domestic Cylinder (10 Kg)",
        cylinderCode: "domestic",
        quantity: 1,
        pricePerUnit: 5000,
        totalPrice: 5000,
        deliveryTime: "As Soon As Possible",
        deliverySchedule: "3 days ago",
        paymentMethod: "Cash on Delivery (COD)",
        status: "delivered",
        createdAt: new Date(now.getTime() - 76 * 3600000).toISOString()
    },
    {
        id: "MBX-882131",
        customerName: "Ali Raza (Burger Town)",
        phone: "03223344556",
        area: "Bahria Town",
        address: "Commercial Area, Sector B, Bahria Town",
        cylinderType: "Commercial Cylinder (45 Kg)",
        cylinderCode: "commercial",
        quantity: 2,
        pricePerUnit: 10000,
        totalPrice: 20000,
        deliveryTime: "Within 24 Hours",
        deliverySchedule: "4 days ago",
        paymentMethod: "Bank Transfer (Askari Bank Ltd)",
        status: "delivered",
        createdAt: new Date(now.getTime() - 100 * 3600000).toISOString()
    }
];

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
                pricePerUnit: Number(body.pricePerUnit) || (body.cylinderCode === 'commercial' ? 10000 : 5000),
                totalPrice: Number(body.totalPrice) || ((Number(body.quantity) || 1) * (body.cylinderCode === 'commercial' ? 10000 : 5000)),
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
