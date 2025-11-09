#!/usr/bin/env python3
import argparse, json
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps

def parse_size(s: str):
    try:
        w, h = s.lower().split('x')
        return int(w), int(h)
    except Exception:
        raise argparse.ArgumentTypeError('Size must be like 2400x1024')

def fit_and_fill(im: Image.Image, target_w: int, target_h: int, mode: str = 'blur', bg=(15, 26, 44)) -> Image.Image:
    # compute scale to fit inside while preserving aspect
    w, h = im.size
    scale = min(target_w / w, target_h / h)
    new_w, new_h = max(1, int(w * scale)), max(1, int(h * scale))
    im_fit = im.resize((new_w, new_h), Image.LANCZOS)

    # background
    if mode == 'blur':
        # cover then blur for natural edges
        cover_scale = max(target_w / w, target_h / h)
        bg_w, bg_h = max(1, int(w * cover_scale)), max(1, int(h * cover_scale))
        bg_im = im.resize((bg_w, bg_h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(radius=24))
        # crop center to target
        left = (bg_w - target_w) // 2
        top = (bg_h - target_h) // 2
        bg_canvas = bg_im.crop((left, top, left + target_w, top + target_h))
    else:
        bg_canvas = Image.new('RGB', (target_w, target_h), bg)

    # paste centered
    x = (target_w - new_w) // 2
    y = (target_h - new_h) // 2
    if im_fit.mode in ('RGBA', 'LA'):
        bg_canvas.paste(im_fit, (x, y), im_fit)
    else:
        bg_canvas.paste(im_fit, (x, y))
    return bg_canvas

def cover_crop(im: Image.Image, target_w: int, target_h: int, focus=(0.5, 0.5), safe=None) -> Image.Image:
    """Scale to cover target and crop around focus, ensuring `safe` rect is fully included.
    focus: (fx,fy) in 0..1, safe: (x0,y0,x1,y1) in 0..1 coords on original image.
    """
    w, h = im.size
    ratio = target_w / target_h
    # initial crop size obeying target ratio
    if w / h > ratio:
        crop_h = h
        crop_w = int(round(h * ratio))
    else:
        crop_w = w
        crop_h = int(round(w / ratio))

    # ensure safe rect fits inside crop; if not, expand crop (bounded by image)
    if safe is not None:
        sx0, sy0, sx1, sy1 = safe
        sx0, sy0, sx1, sy1 = sx0*w, sy0*h, sx1*w, sy1*h
        safe_w = max(1, int(sx1 - sx0))
        safe_h = max(1, int(sy1 - sy0))
        # expand crop size to cover safe rect while keeping ratio
        min_w = max(crop_w, safe_w)
        min_h = max(crop_h, safe_h)
        # adjust min_w/min_h to maintain ratio and be within image bounds
        # try width-limited
        cw = min(w, max(min_w, int(round(min_h * ratio))))
        ch = int(round(cw / ratio))
        if ch > h:
            ch = min(h, max(min_h, int(round(min_w / ratio))))
            cw = int(round(ch * ratio))
        crop_w, crop_h = cw, ch

    # desired center from focus but constrained to include safe rect
    cx = max(0, min(w, focus[0] * w))
    cy = max(0, min(h, focus[1] * h))
    if safe is not None:
        sx0, sy0, sx1, sy1 = safe
        sx0, sy0, sx1, sy1 = sx0*w, sy0*h, sx1*w, sy1*h
        # allowed center ranges
        min_cx = sx0 + crop_w/2
        max_cx = sx1 - crop_w/2
        min_cy = sy0 + crop_h/2
        max_cy = sy1 - crop_h/2
        # if safe rect wider than crop, clamp to image center region
        if min_cx > max_cx:
            min_cx = max_cx = (sx0 + sx1)/2
        if min_cy > max_cy:
            min_cy = max_cy = (sy0 + sy1)/2
        cx = max(min_cx, min(cx, max_cx))
        cy = max(min_cy, min(cy, max_cy))

    left = int(round(cx - crop_w / 2))
    top = int(round(cy - crop_h / 2))
    left = max(0, min(left, w - crop_w))
    top = max(0, min(top, h - crop_h))
    box = (left, top, left + crop_w, top + crop_h)
    cropped = im.crop(box)
    return cropped.resize((target_w, target_h), Image.LANCZOS)

def process_one(src: Path, out_dir: Path, desk_size, mob_size, mode='blur', strategy='contain', quality=85, focus_d=(0.5,0.5), focus_m=(0.5,0.5), safe_d=None, safe_m=None):
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    name = src.stem
    d_w, d_h = desk_size
    m_w, m_h = mob_size

    out_d = out_dir / f"{name}-d.jpg"
    out_m = out_dir / f"{name}-m.jpg"
    out_dir.mkdir(parents=True, exist_ok=True)

    if strategy == 'cover':
        cover_crop(im, d_w, d_h, focus=focus_d, safe=safe_d).save(out_d, 'JPEG', quality=quality, optimize=True, progressive=True)
        cover_crop(im, m_w, m_h, focus=focus_m, safe=safe_m).save(out_m, 'JPEG', quality=quality, optimize=True, progressive=True)
    elif strategy == 'stretch':
        im.resize((d_w, d_h), Image.LANCZOS).save(out_d, 'JPEG', quality=quality, optimize=True, progressive=True)
        im.resize((m_w, m_h), Image.LANCZOS).save(out_m, 'JPEG', quality=quality, optimize=True, progressive=True)
    else:
        fit_and_fill(im, d_w, d_h, mode=mode).save(out_d, 'JPEG', quality=quality, optimize=True, progressive=True)
        fit_and_fill(im, m_w, m_h, mode=mode).save(out_m, 'JPEG', quality=quality, optimize=True, progressive=True)
    return out_m, out_d

def process_pair(src_d: Path, src_m: Path, out_dir: Path, desk_size, mob_size, quality=85, name: str = None, focus_d=(0.5,0.5), focus_m=(0.5,0.5), safe_d=None, safe_m=None):
    im_d = ImageOps.exif_transpose(Image.open(src_d)).convert('RGB')
    im_m = ImageOps.exif_transpose(Image.open(src_m)).convert('RGB')
    out_dir.mkdir(parents=True, exist_ok=True)
    base = name or src_d.stem
    out_d = out_dir / f"{base}-d.jpg"
    out_m = out_dir / f"{base}-m.jpg"
    d_w, d_h = desk_size
    m_w, m_h = mob_size
    cover_crop(im_d, d_w, d_h, focus=focus_d, safe=safe_d).save(out_d, 'JPEG', quality=quality, optimize=True, progressive=True)
    cover_crop(im_m, m_w, m_h, focus=focus_m, safe=safe_m).save(out_m, 'JPEG', quality=quality, optimize=True, progressive=True)
    return out_m, out_d

def main():
    ap = argparse.ArgumentParser(description='Prepare hero images for mobile/desktop with aspect-respecting resizing and fill.')
    # when --manifest is provided, positional images are optional
    ap.add_argument('images', nargs='*', help='Input images under public/ (optional when --manifest is used)')
    ap.add_argument('--out', default='public/hero', help='Output directory')
    ap.add_argument('--desktop', type=parse_size, default='2400x1024', help='Desktop size WxH (default: 2400x1024)')
    ap.add_argument('--mobile', type=parse_size, default='1080x1620', help='Mobile size WxH (default: 1080x1620)')
    ap.add_argument('--mode', choices=['blur', 'solid'], default='blur', help='Background fill mode for padding (used with contain)')
    ap.add_argument('--strategy', choices=['contain', 'cover', 'stretch'], default='contain', help='contain: pad to fit; cover: crop; stretch: non-uniform resize to exact')
    ap.add_argument('--focus-d', type=str, default=None, help='desktop focus as fx,fy in 0..1 (e.g., 0.8,0.5)')
    ap.add_argument('--focus-m', type=str, default=None, help='mobile focus as fx,fy in 0..1')
    ap.add_argument('--focus-map', type=str, default=None, help='JSON mapping base name to {"desktop":[fx,fy],"mobile":[fx,fy]}')
    ap.add_argument('--manifest', type=str, default=None, help='JSON list: {"desktop":"public/...","mobile":"public/...","name":"key","focus":{"desktop":[fx,fy],"mobile":[fx,fy]},"safe":{"desktop":[x0,y0,x1,y1],"mobile":[x0,y0,x1,y1]}}')
    ap.add_argument('--quality', type=int, default=85, help='JPEG quality')
    args = ap.parse_args()

    out_dir = Path(args.out)
    results = []
    focus_map = {}
    if args.focus_map:
        with open(args.focus_map, 'r', encoding='utf-8') as f:
            focus_map = json.load(f)

    def parse_focus(s):
        if not s: return None
        try:
            fx, fy = [float(x.strip()) for x in s.split(',')]
            return (fx, fy)
        except Exception:
            return None

    f_d_cli = parse_focus(args.focus_d)
    f_m_cli = parse_focus(args.focus_m)

    # Manifest mode: explicit desktop/mobile sources per slide
    if args.manifest:
        with open(args.manifest, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
        for item in manifest:
            dsrc = Path(item['desktop'])
            msrc = Path(item['mobile'])
            name = item.get('name') or Path(dsrc).stem
            foc = item.get('focus') or {}
            saf = item.get('safe') or {}
            f_d = tuple(foc.get('desktop', (0.5, 0.5)))
            f_m = tuple(foc.get('mobile', (0.5, 0.5)))
            s_d = tuple(saf.get('desktop', ())) if isinstance(saf.get('desktop', ()), (list, tuple)) and len(saf.get('desktop', ()))==4 else None
            s_m = tuple(saf.get('mobile', ())) if isinstance(saf.get('mobile', ()), (list, tuple)) and len(saf.get('mobile', ()))==4 else None
            m, d = process_pair(dsrc, msrc, out_dir, args.desktop, args.mobile, quality=args.quality, name=name, focus_d=f_d, focus_m=f_m, safe_d=s_d, safe_m=s_m)
            results.append((name, m.as_posix(), d.as_posix()))
            print(f"[ok] {name} -> {Path(m).name}, {Path(d).name}")
        print('\nSummary:')
        for base, m, d in results:
            print(f"- {base}: mobile={m}, desktop={d}")
        return

    for img in args.images:
        src = Path(img)
        if not src.exists():
            print(f"[skip] not found: {src}")
            continue
        base = src.stem
        fcfg = focus_map.get(base, {}) if isinstance(focus_map, dict) else {}
        f_d = tuple(fcfg.get('desktop', ())) if fcfg.get('desktop') else None
        f_m = tuple(fcfg.get('mobile', ())) if fcfg.get('mobile') else None
        focus_d = f_d_cli or f_d or (0.5, 0.5)
        focus_m = f_m_cli or f_m or (0.5, 0.5)
        m, d = process_one(src, out_dir, args.desktop, args.mobile, mode=args.mode, strategy=args.strategy, quality=args.quality, focus_d=focus_d, focus_m=focus_m)
        results.append((src.name, m.as_posix(), d.as_posix()))
        print(f"[ok] {src.name} -> {m.name}, {d.name}")

    print('\nSummary:')
    for base, m, d in results:
        print(f"- {base}: mobile={m}, desktop={d}")

if __name__ == '__main__':
    main()
