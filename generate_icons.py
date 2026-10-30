"""
Mabrix Enterprises - Favicon & App Icons Generator (V3: Perfect Balance, Flat, No Shadow, Smaller M, Admin in Circle)
"""

import os
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def create_customer_icon(size=512):
    # Pure flat brand yellow background (#F6AD3A)
    img = Image.new("RGBA", (size, size), (246, 173, 58, 255))
    draw = ImageDraw.Draw(img)

    font_path = "C:/Windows/Fonts/ariblk.ttf"
    if not os.path.exists(font_path):
        font_path = "C:/Windows/Fonts/arialbd.ttf"
    
    font_size = int(size * 0.68)
    font = ImageFont.truetype(font_path, font_size)

    # Measure text "M"
    bbox = draw.textbbox((0, 0), "M", font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]

    # Exactly centered, pure flat without shadow
    x = (size - w) / 2 - bbox[0]
    y = (size - h) / 2 - bbox[1]

    # Draw pure flat brand navy blue M (#15387C)
    draw.text((x, y), "M", fill=(21, 56, 124, 255), font=font)

    return img

def create_admin_icon(size=512):
    # Pure flat brand yellow background (#F6AD3A)
    img = Image.new("RGBA", (size, size), (246, 173, 58, 255))
    draw = ImageDraw.Draw(img)

    font_path = "C:/Windows/Fonts/ariblk.ttf"
    if not os.path.exists(font_path):
        font_path = "C:/Windows/Fonts/arialbd.ttf"
    
    # "M" is scaled to ~0.46 for balanced proportion
    font_size_m = int(size * 0.46)
    font_m = ImageFont.truetype(font_path, font_size_m)

    bbox_m = draw.textbbox((0, 0), "M", font=font_m)
    w_m = bbox_m[2] - bbox_m[0]
    h_m = bbox_m[3] - bbox_m[1]

    x_m = (size - w_m) / 2 - bbox_m[0]
    y_m = int(size * 0.07) - bbox_m[1]

    # Pure flat blue M (NO shadow)
    draw.text((x_m, y_m), "M", fill=(21, 56, 124, 255), font=font_m)

    # Admin Badge in a CIRCLE at the bottom
    circle_radius = int(size * 0.19) # diameter = 195px
    circle_cx = size // 2
    circle_cy = int(size * 0.72)

    c_box = [
        circle_cx - circle_radius,
        circle_cy - circle_radius,
        circle_cx + circle_radius,
        circle_cy + circle_radius
    ]

    # Draw navy circle (#15387C) with white stroke
    draw.ellipse(c_box, fill=(21, 56, 124, 255), outline=(255, 255, 255, 255), width=int(size * 0.012))

    # "ADMIN" text inside circle
    font_admin_size = int(size * 0.082) # ~42px
    font_admin = ImageFont.truetype(font_path, font_admin_size)

    bbox_a = draw.textbbox((0, 0), "ADMIN", font=font_admin)
    w_a = bbox_a[2] - bbox_a[0]
    h_a = bbox_a[3] - bbox_a[1]

    x_a = circle_cx - (w_a / 2) - bbox_a[0]
    y_a = circle_cy - (h_a / 2) - bbox_a[1] - (size * 0.003)

    # Crisp white text inside the navy circle
    draw.text((x_a, y_a), "ADMIN", fill=(255, 255, 255, 255), font=font_admin)

    return img

def create_svg_icons():
    # Vector SVG for Customer Store (Flat, No Shadow)
    svg_cust = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" fill="#F6AD3A"/>
  <text x="256" y="360" font-family="'Arial Black', 'Segoe UI Black', -apple-system, sans-serif" font-weight="900" font-size="360" text-anchor="middle" fill="#15387C">M</text>
</svg>'''
    with open(os.path.join(BASE_DIR, "favicon.svg"), "w", encoding="utf-8") as f:
        f.write(svg_cust)

    # Vector SVG for Admin Portal (Smaller M, Circle Badge, No Shadow)
    svg_admin = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" fill="#F6AD3A"/>
  <!-- Smaller M -->
  <text x="256" y="260" font-family="'Arial Black', 'Segoe UI Black', -apple-system, sans-serif" font-weight="900" font-size="245" text-anchor="middle" fill="#15387C">M</text>
  <!-- Admin Circle Badge -->
  <circle cx="256" cy="370" r="98" fill="#15387C" stroke="#FFFFFF" stroke-width="6"/>
  <!-- Admin Text -->
  <text x="256" y="386" font-family="'Arial Black', 'Segoe UI Black', -apple-system, sans-serif" font-weight="900" font-size="42" text-anchor="middle" fill="#FFFFFF" letter-spacing="1.5">ADMIN</text>
</svg>'''
    with open(os.path.join(BASE_DIR, "admin-favicon.svg"), "w", encoding="utf-8") as f:
        f.write(svg_admin)

def main():
    icons_dir = os.path.join(BASE_DIR, "icons")
    os.makedirs(icons_dir, exist_ok=True)

    # 1. Customer Store Master Image
    cust_512 = create_customer_icon(512)
    cust_512.save(os.path.join(icons_dir, "icon-512.png"), "PNG")
    cust_512.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "icon-192.png"), "PNG")
    cust_512.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "apple-touch-icon.png"), "PNG")
    cust_512.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "favicon-32x32.png"), "PNG")
    cust_512.resize((16, 16), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "favicon-16x16.png"), "PNG")

    # Root files
    cust_512.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(BASE_DIR, "apple-touch-icon.png"), "PNG")
    cust_512.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(BASE_DIR, "favicon.ico"), "ICO")
    cust_512.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(BASE_DIR, "icon-192.png"), "PNG")
    cust_512.save(os.path.join(BASE_DIR, "icon-512.png"), "PNG")

    # 2. Admin Portal Master Image
    admin_512 = create_admin_icon(512)
    admin_512.save(os.path.join(icons_dir, "admin-icon-512.png"), "PNG")
    admin_512.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "admin-icon-192.png"), "PNG")
    admin_512.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "admin-apple-touch-icon.png"), "PNG")
    admin_512.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "admin-favicon-32x32.png"), "PNG")
    admin_512.resize((16, 16), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "admin-favicon-16x16.png"), "PNG")

    # Root files for admin
    admin_512.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(BASE_DIR, "admin-apple-touch-icon.png"), "PNG")
    admin_512.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(BASE_DIR, "admin-favicon.ico"), "ICO")
    admin_512.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(BASE_DIR, "admin-icon-192.png"), "PNG")
    admin_512.save(os.path.join(BASE_DIR, "admin-icon-512.png"), "PNG")

    # 3. Vector SVGs
    create_svg_icons()

    print("Icons successfully re-generated: Flat, no shadow, smaller M in Admin, ADMIN in balanced circle!")

if __name__ == "__main__":
    main()
