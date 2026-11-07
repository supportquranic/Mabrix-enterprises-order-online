"""
Mabrix Enterprises - Local Backend Server with REST API & Static File Serving
Usage: python server.py [port]
Default Port: 3000
"""

import os
import json
import http.server
import socketserver
import urllib.parse
from datetime import datetime

PORT = 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
ORDERS_FILE = os.path.join(DATA_DIR, 'orders.json')
RATES_FILE = os.path.join(DATA_DIR, 'rates.json')

# Ensure data directory, orders.json, and rates.json exist
os.makedirs(DATA_DIR, exist_ok=True)
if not os.path.exists(ORDERS_FILE):
    with open(ORDERS_FILE, 'w', encoding='utf-8') as f:
        json.dump([], f)

if not os.path.exists(RATES_FILE):
    with open(RATES_FILE, 'w', encoding='utf-8') as f:
        json.dump({'perKg': 560, 'domestic': 560, 'commercial': 560, 'isDefault': True, 'isCustom': False, 'updatedAt': '2026-01-01T00:00:00.000Z'}, f, indent=2)

def read_rates():
    try:
        with open(RATES_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if 'perKg' not in data:
                rate = data.get('commercial') or data.get('domestic') or 560
                data['perKg'] = rate
                data['domestic'] = rate
                data['commercial'] = rate
            return data
    except Exception:
        return {'perKg': 560, 'domestic': 560, 'commercial': 560, 'isDefault': True, 'isCustom': False, 'updatedAt': '2026-01-01T00:00:00.000Z'}

def write_rates(rates):
    try:
        with open(RATES_FILE, 'w', encoding='utf-8') as f:
            json.dump(rates, f, indent=2, ensure_ascii=False)
        return True
    except Exception:
        return False

def read_orders():
    try:
        with open(ORDERS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []

def write_orders(orders):
    try:
        with open(ORDERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(orders, f, indent=2, ensure_ascii=False)
        return True
    except Exception:
        return False

class MabrixHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable aggressive caching for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/rates':
            rates = read_rates()
            response_data = json.dumps({'success': True, 'rates': rates}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(response_data)))
            self.end_headers()
            self.wfile.write(response_data)
            return

        if parsed.path == '/api/customer':
            query = urllib.parse.parse_qs(parsed.query)
            if query.get('all', [''])[0] == 'true' or query.get('list', [''])[0] == 'true':
                orders = read_orders()
                cust_map = {}
                for o in orders:
                    p = o.get('phone', '').strip()
                    if not p:
                        continue
                    if p not in cust_map:
                        cust_map[p] = {
                            'name': o.get('customerName') or o.get('name') or '',
                            'phone': p,
                            'area': o.get('area') or 'Bahria Town',
                            'address': o.get('address') or '',
                            'totalOrders': 1,
                            'lastCylinderType': o.get('cylinderCode') or 'domestic',
                            'lastOrderedAt': o.get('createdAt')
                        }
                    else:
                        cust_map[p]['totalOrders'] += 1
                        if o.get('createdAt') and (not cust_map[p]['lastOrderedAt'] or o.get('createdAt') > cust_map[p]['lastOrderedAt']):
                            cust_map[p]['lastOrderedAt'] = o.get('createdAt')
                            cust_map[p]['lastCylinderType'] = o.get('cylinderCode') or cust_map[p]['lastCylinderType']
                            if o.get('address'):
                                cust_map[p]['address'] = o.get('address')
                cust_list = list(cust_map.values())
                cust_list.sort(key=lambda x: (x.get('lastOrderedAt') or ''), reverse=True)
                response_data = json.dumps({'success': True, 'count': len(cust_list), 'customers': cust_list}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(response_data)))
                self.end_headers()
                self.wfile.write(response_data)
                return

            raw_phone = query.get('phone', [''])[0]
            clean_phone = ''.join(ch for ch in str(raw_phone) if ch.isdigit())
            if clean_phone.startswith('92'):
                clean_phone = clean_phone[2:]
            if clean_phone.startswith('0'):
                clean_phone = clean_phone[1:]

            orders = read_orders()
            found_cust = None
            for o in reversed(orders):
                p = o.get('phone', '')
                cp = ''.join(ch for ch in str(p) if ch.isdigit())
                if cp.startswith('92'):
                    cp = cp[2:]
                if cp.startswith('0'):
                    cp = cp[1:]
                if clean_phone and len(clean_phone) >= 7 and (clean_phone == cp or cp.endswith(clean_phone) or clean_phone.endswith(cp)):
                    found_cust = {
                        'name': o.get('customerName') or o.get('name') or '',
                        'phone': p,
                        'area': o.get('area') or 'Bahria Town',
                        'address': o.get('address') or '',
                        'lastCylinderType': o.get('cylinderCode') or 'domestic'
                    }
                    break

            if found_cust:
                response_data = json.dumps({'success': True, 'found': True, 'customer': found_cust}).encode('utf-8')
            else:
                response_data = json.dumps({'success': True, 'found': False}).encode('utf-8')

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(response_data)))
            self.end_headers()
            self.wfile.write(response_data)
            return

        if parsed.path == '/api/orders':
            orders = read_orders()
            response_data = json.dumps({'success': True, 'count': len(orders), 'orders': orders}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(response_data)))
            self.end_headers()
            self.wfile.write(response_data)
            return

        # Fallback to standard static file serving (index.html, admin.html, etc.)
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/rates':
            content_length = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_length).decode('utf-8')
            try:
                body = json.loads(post_body)
            except Exception:
                body = {}

            current = read_rates()
            rate_val = body.get('perKg') or body.get('commercial') or body.get('domestic') or current.get('perKg', 560)
            rate_int = int(rate_val)
            current['perKg'] = rate_int
            current['domestic'] = rate_int
            current['commercial'] = rate_int
            current['isDefault'] = False
            current['isCustom'] = True
            current['updatedAt'] = body.get('updatedAt') or datetime.now().isoformat()
            write_rates(current)

            response_data = json.dumps({'success': True, 'rates': current}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(response_data)))
            self.end_headers()
            self.wfile.write(response_data)
            return
        if parsed.path == '/api/orders':
            content_length = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_length).decode('utf-8')
            try:
                body = json.loads(post_body)
            except Exception:
                body = {}

            orders = read_orders()
            new_id = body.get('id') or f"MBX-{int(datetime.now().timestamp() * 1000) % 1000000}"
            cylinder_code = body.get('cylinderCode', 'domestic')
            weight_kg = int(body.get('weightKg', 45 if cylinder_code == 'commercial' else 10))
            price_per_kg = int(body.get('pricePerKg', 560))
            quantity = int(body.get('quantity', 1))
            unit_price = int(body.get('pricePerUnit', weight_kg * price_per_kg))
            total_price = int(body.get('totalPrice', quantity * unit_price))

            order = {
                'id': new_id,
                'customerName': body.get('customerName', 'Customer'),
                'phone': body.get('phone', ''),
                'area': body.get('area', 'Bahria Town'),
                'address': body.get('address', ''),
                'cylinderType': body.get('cylinderType', f"{'Commercial' if cylinder_code == 'commercial' else 'Domestic'} Cylinder ({weight_kg} Kg)"),
                'cylinderCode': cylinder_code,
                'weightKg': weight_kg,
                'pricePerKg': price_per_kg,
                'quantity': quantity,
                'pricePerUnit': unit_price,
                'totalPrice': total_price,
                'deliveryTime': body.get('deliveryTime', 'As Soon As Possible'),
                'deliverySchedule': body.get('deliverySchedule', 'today'),
                'paymentMethod': body.get('paymentMethod', 'Cash on Delivery (COD)'),
                'status': body.get('status', 'pending'),
                'createdAt': body.get('createdAt', datetime.now().isoformat()),
                'notes': body.get('notes', '')
            }

            orders.insert(0, order)
            write_orders(orders)

            response_data = json.dumps({'success': True, 'order': order}).encode('utf-8')
            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(response_data)))
            self.end_headers()
            self.wfile.write(response_data)
            return

        self.send_response(404)
        self.end_headers()

    def do_PATCH(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/orders':
            content_length = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_length).decode('utf-8')
            try:
                body = json.loads(post_body)
            except Exception:
                body = {}

            order_id = body.get('id')
            new_status = body.get('status')

            orders = read_orders()
            found = False
            updated_order = None
            for o in orders:
                if o.get('id') == order_id:
                    o['status'] = new_status
                    o['updatedAt'] = datetime.now().isoformat()
                    updated_order = o
                    found = True
                    break

            if found:
                write_orders(orders)
                response_data = json.dumps({'success': True, 'order': updated_order}).encode('utf-8')
                self.send_response(200)
            else:
                response_data = json.dumps({'success': False, 'message': 'Order not found'}).encode('utf-8')
                self.send_response(404)

            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(response_data)))
            self.end_headers()
            self.wfile.write(response_data)
            return

        self.send_response(404)
        self.end_headers()

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/orders':
            write_orders([])
            response_data = json.dumps({'success': True, 'message': 'Orders cleared'}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(response_data)))
            self.end_headers()
            self.wfile.write(response_data)
            return

        self.send_response(404)
        self.end_headers()

def run(port=PORT):
    os.chdir(BASE_DIR)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), MabrixHandler) as httpd:
        print(f"Mabrix Enterprises Server running at http://localhost:{port}/")
        print(f"Customer Page: http://localhost:{port}/index.html")
        print(f"Admin Dashboard: http://localhost:{port}/admin.html")
        httpd.serve_forever()

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run(port)
