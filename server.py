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
        json.dump({'domestic': 5000, 'commercial': 10000, 'isDefault': True, 'isCustom': False, 'updatedAt': '2026-01-01T00:00:00.000Z'}, f, indent=2)

def read_rates():
    try:
        with open(RATES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {'domestic': 5000, 'commercial': 10000, 'isDefault': True, 'isCustom': False, 'updatedAt': '2026-01-01T00:00:00.000Z'}

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
            if 'domestic' in body and body['domestic'] is not None:
                current['domestic'] = int(body['domestic'])
            if 'commercial' in body and body['commercial'] is not None:
                current['commercial'] = int(body['commercial'])
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
            quantity = int(body.get('quantity', 1))
            unit_price = int(body.get('pricePerUnit', 10000 if cylinder_code == 'commercial' else 5000))
            total_price = int(body.get('totalPrice', quantity * unit_price))

            order = {
                'id': new_id,
                'customerName': body.get('customerName', 'Customer'),
                'phone': body.get('phone', ''),
                'area': body.get('area', 'Bahria Town'),
                'address': body.get('address', ''),
                'cylinderType': body.get('cylinderType', 'Domestic Cylinder (10 Kg)'),
                'cylinderCode': cylinder_code,
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
