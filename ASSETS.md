Image assets guide

Current files used by the invitation:

- Hero slider: `public/ritz-lounge_1.jpg`, `public/ritz-flowers_1.jpg`, `public/ring-bouquet_1.jpg`
- Countdown background: `public/countdown1.jpg`
- Couple photos: `public/groom.JPG`, `public/bride.JPG`
- Welcome overlay (optional): `public/welcome-overlay.png`
- Favicon/crest: `public/favicon.png`

Notes

- Use the `_1.jpg` optimized variants for the hero and countdown to keep load fast.
- If you replace any image, keep the same filename or update paths in `app/app.config.ts`.
- Monogram is not used right now. If you later add one, set `monogramUrl` in `app/app.config.ts` and it will appear in the hero meta band and footer.
- Large originals such as `*.JPG` can stay as source files. If you want to reduce repository size, consider compressing them and regenerating `_1.jpg` versions.

