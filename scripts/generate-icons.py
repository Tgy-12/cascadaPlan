import os
from PIL import Image, ImageDraw

def generate_icons():
    out_dir = "/home/tgy/Projects/Dplan/public/icons"
    os.makedirs(out_dir, exist_ok=True)
    sizes = [16, 48, 128]

    for size in sizes:
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Gradient simulation / background squircle
        margin = max(1, size // 10)
        r = max(2, size // 4)
        
        # Outer rounded rect (Aubergine to Orange)
        draw.rounded_rectangle(
            [(margin, margin), (size - margin, size - margin)],
            radius=r,
            fill=(119, 33, 111, 255), # Ubuntu Aubergine #77216F
            outline=(233, 84, 32, 255), # Ubuntu Orange #E95420
            width=max(1, size // 32)
        )

        # Cascading bars
        bar_h = max(2, int(size * 0.1))
        
        # Bar 1 (Top)
        w1 = int(size * 0.6)
        x1 = (size - w1) // 2
        y1 = int(size * 0.25)
        draw.rounded_rectangle([(x1, y1), (x1 + w1, y1 + bar_h)], radius=bar_h//2, fill=(255, 255, 255, 240))

        # Bar 2 (Middle)
        w2 = int(size * 0.45)
        x2 = (size - w2) // 2
        y2 = int(size * 0.42)
        draw.rounded_rectangle([(x2, y2), (x2 + w2, y2 + bar_h)], radius=bar_h//2, fill=(255, 255, 255, 190))

        # Bar 3 (Lower)
        w3 = int(size * 0.3)
        x3 = (size - w3) // 2
        y3 = int(size * 0.58)
        draw.rounded_rectangle([(x3, y3), (x3 + w3, y3 + bar_h)], radius=bar_h//2, fill=(255, 255, 255, 140))

        # Bottom green focus check dot (if size >= 48)
        if size >= 32:
            dot_r = max(2, int(size * 0.08))
            dot_x = size // 2
            dot_y = int(size * 0.78)
            draw.ellipse([(dot_x - dot_r, dot_y - dot_r), (dot_x + dot_r, dot_y + dot_r)], fill=(56, 180, 74, 255))

        out_path = os.path.join(out_dir, f"icon-{size}.png")
        img.save(out_path, "PNG")
        print(f"Generated {out_path} ({size}x{size})")

if __name__ == "__main__":
    generate_icons()
