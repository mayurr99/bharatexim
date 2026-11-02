# Bharat Exim Traders — Website Change Log

Traceable record of refinements applied to the static site in `dist/`.
Content, page structure and brand colours are unchanged unless listed here.

## Refinement pass 3 (current)
- **Founder card icon** (`about.html`, `index.html`): fixed blank icon. A CSS filter had turned the gold emblem white on a white tile. Now the official gold emblem (`assets/logo-emblem.png`) sits on a subtle translucent gold tile (`enhance.css` → `.story-globe-wrap`).
- **Founder card watermark**: reduced from visible to subtle (opacity 0.045, 0.07 on hover).
- **Hero accent text**: "Worldwide Possibilities." darkened for readable contrast on cream.
- **Verified**: rendered at 1440px desktop and 390px mobile; no horizontal overflow on all 9 pages; mobile menu opens full-screen with staggered animation.

## Refinement pass 2
- **Logo assets**: rebuilt `logo-emblem.png` and `logo-emblem-blue.png` by cropping the official `logo.png` (the previous versions were corrupted).
- **New**: `logo-on-dark.png` (mockup: official logo on navy) and `logo-emblem-badge.png`.
- **Footer logo**: official logo on a white plate, scoped to the footer only (`footer .brand-logo-img`).
- **Header logo**: plate removed; shows the official logo cleanly.
- **Footer layout**: four-column grid (desktop), two-column (tablet), single column (phone).
- **Mobile menu**: root cause fixed. The header's background blur was trapping the fixed drawer; the blur is removed while the menu is open.
- **Mobile menu animation**: fade and slide in, staggered item entrance, smooth Products submenu expand/collapse, Escape closes the menu (`app.js`).

## Refinement pass 1
- **New stylesheet** `enhance.css` loaded on all pages after `style.css`: fluid type scale, section rhythm, equal-height card grids, visible keyboard focus, 44px+ touch targets, reduced-motion support.
- **SEO**: homepage `<title>` and Open Graph title shortened.
- **Audit**: all pages checked for one H1, image alt text, meta description, canonical URL, viewport tag and JSON-LD (all passed).

## Known items for the owner
- `build_pages.py` regenerates HTML and will overwrite manual edits (stylesheet link, title, logo references). Update the template before regenerating.
- Category photos are AI-generated; no certification documents or registration numbers have been supplied.

## Pass 4 — Enquiry submission, security and hosting
- **Direct form submission**: the contact form posts to `dist/api/enquiry.php` (PHP, runs on Hostinger) and no longer opens the visitor's email app. The email goes to the business inbox and a confirmation goes to the visitor. Email drafting remains as a fallback if the server is unreachable.
- **Success message**: after a valid submission the form is replaced with "Enquiry received" and a "Send another enquiry" button. Errors show next to each field and in a status line (`dist/contact-form.js`).
- **Works without JavaScript**: the form still posts and redirects to `contact.html?sent=1` to show the success message.
- **Spam and abuse protection**: hidden honeypot field, minimum fill time, rate limit (5 per 10 minutes per connection, IP hashed with a private salt), request-origin check, size limit, input validation and header-injection protection.
- **Private keys and config**: the salt and recipient settings live in `private/enquiry-config.php` on the server, outside `public_html`. The browser never receives them. `private/enquiry-config.example.php` is the template and `.gitignore` excludes real config and logs.
- **Security headers** (`dist/.htaccess`): HTTPS redirect, HSTS, Content-Security-Policy (no inline scripts), X-Frame-Options DENY, nosniff, referrer and permissions policies, no directory listings, and blocked access to sensitive file types.
- **Performance**: caching and gzip compression rules for static files.
- **Guide**: see `DEPLOY-HOSTINGER.md` for domain connection, hosting setup and the security checklist.
