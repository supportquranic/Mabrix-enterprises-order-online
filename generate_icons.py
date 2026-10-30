"""
Mabrix Enterprises - Favicon & App Icons Generator
Generates high-res icons for Customer Store and Admin Portal
- Yellow background (#F6AD3A)
- Brand Navy Blue "M" (#15387C) using ultra-solid Arial Black
- Admin badge with "ADMIN" text for Admin app icon
"""

import os
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def create_customer_icon(size=512):
    # Base image with brand yellow background
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

    # Center position
    x = (size - w) / 2 - bbox[0]
    y = (size - h) / 2 - bbox[1] - (size * 0.015)

    # Soft subtle drop shadow
    shadow_offset = int(size * 0.018)
    draw.text((x + shadow_offset, y + shadow_offset), "M", fill=(185, 118, 18, 160), font=font)

    # Main text in brand blue (#15387C)
    draw.text((x, y), "M", fill=(21, 56, 124, 255), font=font)

    return img

def create_admin_icon(size=512):
    # Base image with brand yellow background
    img = Image.new("RGBA", (size, size), (246, 173, 58, 255))
    draw = ImageDraw.Draw(img)

    font_path = "C:/Windows/Fonts/ariblk.ttf"
    if not os.path.exists(font_path):
        font_path = "C:/Windows/Fonts/arialbd.ttf"
    
    # "M" scaled and shifted up for the "ADMIN" badge
    font_size = int(size * 0.55)
    font_m = ImageFont.truetype(font_path, font_size)

    bbox_m = draw.textbbox((0, 0), "M", font=font_m)
    w_m = bbox_m[2] - bbox_m[0]
    h_m = bbox_m[3] - bbox_m[1]

    x_m = (size - w_m) / 2 - bbox_m[0]
    y_m = (size * 0.12) - bbox_m[1]

    # Subtle soft drop shadow for M
    shadow_offset = int(size * 0.016)
    draw.text((x_m + shadow_offset, y_m + shadow_offset), "M", fill=(185, 118, 18, 160), font=font_m)
    draw.text((x_m, y_m), "M", fill=(21, 56, 124, 255), font=font_m)

    # Admin Badge Pill at the bottom
    badge_w = int(size * 0.74)
    badge_h = int(size * 0.19)
    badge_x0 = (size - badge_w) // 2
    badge_y0 = int(size * 0.70)
    badge_x1 = badge_x0 + badge_w
    badge_y1 = badge_y0 + badge_h
    corner_radius = badge_h // 2

    # Draw navy pill (#15387C) with subtle shadow
    draw.rounded_rectangle([badge_x0, badge_y0 + int(size * 0.012), badge_x1, badge_y1 + int(size * 0.012)], radius=corner_radius, fill=(185, 118, 18, 160))
    draw.rounded_rectangle([badge_x0, badge_y0, badge_x1, badge_y1], radius=corner_radius, fill=(21, 56, 124, 255))

    # Border on badge for sharpness
    draw.rounded_rectangle([badge_x0, badge_y0, badge_x1, badge_y1], radius=corner_radius, outline=(255, 255, 255, 200), width=max(2, int(size * 0.006)))

    # "ADMIN" text inside pill
    font_admin_size = int(badge_h * 0.58)
    font_admin = ImageFont.truetype(font_path, font_admin_size)
    bbox_a = draw.textbbox((0, 0), "ADMIN", font=font_admin)
    w_a = bbox_a[2] - bbox_a[0]
    h_a = bbox_a[3] - bbox_a[1]
    x_a = (size - w_a) / 2 - bbox_a[0]
    y_a = badge_y0 + (badge_h - h_a) / 2 - bbox_a[1] - (badge_h * 0.04)

    draw.text((x_a, y_a), "ADMIN", fill=(255, 255, 255, 255), font=font_admin)

    return img

def create_svg_icons():
    # Vector SVG for Customer Store
    svg_cust = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" fill="#F6AD3A"/>
  <!-- Subtle depth shadow -->
  <text x="261" y="367" font-family="'Arial Black', 'Segoe UI Black', -apple-system, sans-serif" font-weight="900" font-size="360" text-anchor="middle" fill="#b97612" opacity="0.65">M</text>
  <!-- Primary Navy M -->
  <text x="256" y="360" font-family="'Arial Black', 'Segoe UI Black', -apple-system, sans-serif" font-weight="900" font-size="360" text-anchor="middle" fill="#15387C">M</text>
</svg>'''
    with open(os.path.join(BASE_DIR, "favicon.svg"), "w", encoding="utf-8") as f:
        f.write(svg_cust)

    # Vector SVG for Admin Portal
    svg_admin = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" fill="#F6AD3A"/>
  <!-- Subtle depth shadow for M -->
  <text x="261" y="318" font-family="'Arial Black', 'Segoe UI Black', -apple-system, sans-serif" font-weight="900" font-size="285" text-anchor="middle" fill="#b97612" opacity="0.65">M</text>
  <!-- Primary Navy M -->
  <text x="256" y="312" font-family="'Arial Black', 'Segoe UI Black', -apple-system, sans-serif" font-weight="900" font-size="285" text-anchor="middle" fill="#15387C">M</text>
  <!-- Admin Pill Badge Shadow -->
  <rect x="66" y="364" width="380" height="96" rx="48" fill="#b97612" opacity="0.6"/>
  <!-- Admin Pill Badge -->
  <rect x="66" y="358" width="380" height="96" rx="48" fill="#15387C" stroke="#FFFFFF" stroke-width="3"/>
  <!-- Admin Text -->
  <text x="256" y="425" font-family="'Arial Black', 'Segoe UI Black', -apple-system, sans-serif" font-weight="900" font-size="52" text-anchor="middle" fill="#FFFFFF" letter-spacing="2">ADMIN</text>
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

    # Root files for direct / browser default lookups
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

    print("All icons & SVGs successfully generated!")

if __name__ == "__main__":
    main()
