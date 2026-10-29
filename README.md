# Mabrix Enterprises - LPG Gas Supply & Delivery

Online ordering platform and mobile-first Admin Management Dashboard for **Mabrix Enterprises** specializing in LPG Gas Cylinder supply and express delivery across:
- Bahria Town
- Lake City
- Khyaban-e-Amin
- Wapda Town
- Valencia Town
- Nearby Areas

---

## 📱 Web Portals
- **Customer Web App**: [`index.html`](index.html)
- **Admin Dashboard**: [`admin.html`](admin.html)

---

## 📊 Admin Dashboard Features
- **Mobile-First UI** inspired by modern fintech / operational dashboards with clean white background and official project colors (`#15387C` & `#F6AD3A`).
- **Real-Time Order Storage**: Orders submitted by customers are instantly captured and synchronized into the Admin Panel.
- **Immediate Notifications**:
  - Synthesized Web Audio chime alert on new bookings.
  - In-app notification popup banner.
  - Unread badge counter on notification bell.
- **Time Range Selector & 4 Metric Cards**:
  - Today Total Orders & Today's Sale.
  - Weekly Orders & Weekly Sale.
  - Interactive Hourly Cylinder Dispatches Bar Chart.
- **Pending Deliveries Tab**:
  - **Pending for Today** sub-tab.
  - **Pending for Tomorrow** sub-tab.
  - One-tap customer Call and direct WhatsApp messaging.
  - Order status workflows: Pending ➔ Dispatched ➔ Delivered.
- **Floating Dark Bottom Navigation Bar** with intelligent tab switching.

---

## 🚀 Running Locally
```bash
# Run local backend server with REST API on port 3000
python server.py 3000
```
- Open customer app: `http://localhost:3000/`
- Open admin panel: `http://localhost:3000/admin.html`
