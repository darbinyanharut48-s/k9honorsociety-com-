# K9 Honor Society — Website

A single-page, responsive, accessible site built with **HTML5, Tailwind CSS (CDN) and vanilla JavaScript**. No build step and no backend.

**Open `index.html` in a browser and it works.** (It loads Tailwind and the Google Fonts over the internet, so you need a connection the first time.)

## Files

| File | Purpose |
|---|---|
| `index.html` | All content, SEO tags, JSON-LD, and the SVG sprite (stars and icons) |
| `styles.css` | Custom styles only: patriotic textures, soft promise and impact cards, timeline, form states |
| `script.js` | Menu, scroll effects, carousel, form handling. **Settings are in the `CONFIG` block at the top.** |
| `favicon.png`, `apple-touch-icon.png` | Browser-tab and phone home-screen icons: the "K9" from the logo |
| `images/logo.webp`, `images/logo.png` | The complete logo (transparent background). `logo.png` is also the `"logo"` in the JSON-LD |
| `images/logo-emblem.webp` | The logo's emblem (man and dog, without lettering), used in the header, the Our Mission photo corner and the contact card |
| `robots.txt`, `sitemap.xml` | Search-engine basics (already point to `https://k9honorsociety.com`) |

## Before you launch: the placeholder checklist

Search the project for `TODO` to find every item. In short:

- [ ] **Photos** — the hero, Our Mission, Who We Serve and Stories photos are yours; confirm you hold the rights and each person's permission. Only the share image (`og:image`) is still an Unsplash placeholder (see below).
- [ ] **Testimonials** — all five stories (Marcus Williams, Rebecca Miller, Robert Thompson, Jasmine Carter, Michael Anderson) are in; confirm you have each person's written permission to publish their story and photo. Consider adding a law enforcement officer's story too, since the site serves both groups (see below).
- [ ] **Form** — paste your Web3Forms access key into `script.js` (see "Connect the contact form" below). Until then it falls back to the visitor's email app.
- [ ] **Donate / Sponsor / Volunteer links** — add real URLs (see below).
- [ ] **Legal wording** — add your EIN / tax-deductibility statement once confirmed. None is claimed anywhere on this site.
- [ ] **Share image** — replace the `og:image` / `twitter:image` placeholder with a 1200×630 image on your own domain.
- [ ] **Social profiles** — add a `"sameAs": [...]` list to the JSON-LD block in `index.html`.

## Replace the images

Every image has a comment above it that starts with `TODO(IMAGE)` and says what it is and the ideal size. The hero, Our Mission, Who We Serve and Stories photos are your own (in `images/`). The only remaining placeholder (the share image, `og:image` in the `<head>`) is a free-to-use photo from Unsplash.

1. Put your photos in a new `images/` folder (JPG or WebP, compressed; ideally under 300 KB each).
2. In `index.html`, change the `src` to `images/your-photo.jpg`. If the image has a `srcset="…"` attribute, **delete the whole `srcset`** (it points at the placeholder) or supply your own resized versions.
3. Update the `alt` text to describe the real photo. (The hero image is decorative, so its `alt` is intentionally empty.)

| Where | Ideal size | Notes |
|---|---|---|
| Hero background | 1920×1080 or larger, landscape | Already your own photo: `images/hero.webp` (1672×941; a 1920px-wide version would be sharper on big screens). The headline sits on the left, so keep the subjects on the right. Crop is set by `object-position` in `.hero-bg` (`styles.css`); on phones only about a fifth of a wide photo fits, so a portrait version would look best there |
| Our Mission photo | 1600×900 landscape (16:9) | Already your own photo: `images/mission.webp`, plus `images/mission-800.webp` as the phone-size copy. If you swap it, replace both files and update the `width`/`height` in `index.html` (or delete the `srcset`) |
| Veterans / Law Enforcement cards | 1000×625 or larger, landscape | Already your own photos: `images/card-veterans.webp` and `images/card-officers.webp` (each with a `-600` phone-size copy). They are cropped to 16:10; the officer photo keeps its top in view via an inline `object-position` |
| Testimonial photos | Roughly 900×1100 portrait or 700×700 square | The five stories use `images/story-marcus.webp`, `story-rebecca.webp`, `story-robert.webp`, `story-jasmine.webp` and `story-michael.webp`. Photos are cropped to fit, so keep faces in the upper-middle of the frame (adjust `object-position` in the `.photo-top` rule in `styles.css` if needed) |
| Share image (`og:image`) | 1200×630 | In the `<head>` |

The navy gradient over the hero is applied in CSS (`.hero-overlay` in `styles.css`), so it works with any photo.

## Edit text

All copy is plain text in `index.html`. Each section has a header comment (`1. TOP BAR`, `2. HERO`, … `11. FOOTER`). Headings are written in normal case and shown uppercase by CSS.

**Contact details** appear in several places (top bar, mobile menu, Support section, Get in Touch card, footer, JSON-LD, and `script.js`). To change them, use your editor's find-and-replace across the project for `(818) 532-8282`, `+18185328282`, `+1-818-532-8282`, `help@k9honorsociety.com` and `Voskan Azaryan`.

## Gratitude section

The **Thank you for your service** section (`id="gratitude"`) is plain text in `index.html` and replaces the old statistics cards, so there are no placeholder numbers to fill in. When you have real figures you are happy to share (families matched, states reached), add them as a short sentence here or in the intro text rather than as a separate stats block.

## Friends for life (moving photo rows)

The dark **Friends / For / Life.** section (`id="friends"`, right below Our Mission; to move it, cut its whole `<section>` block and paste it elsewhere) shows three rows of photos that drift slowly in alternating directions (top row to the right, middle row to the left, bottom row to the right). The headline words sit inside the rows and travel with the photos.

- **Photos:** `images/tile-*.webp` (560×400), cut from your own photos. To swap one, replace the tile file keeping the same name. A row repeats its set 4 times to loop seamlessly, so if you change a file name in the HTML, change it in all 4 copies (find-and-replace).
- **Words:** the `marquee-word` spans. The real heading for screen readers is the hidden `<h2>` ("Friends for life.").
- **Speed and direction:** each row's `<div class="marquee-track …" style="--dur:56s">`: a larger number is slower; `marquee-track--right` moves right, without it the row moves left.
- **Accessibility:** a "Pause motion" button, rows pause on hover and while off-screen, and the movement is switched off for visitors who prefer reduced motion.
- Please confirm you hold the rights and each person's permission for the photos shown here.

## Testimonials

The **Stories** carousel has 5 `<li class="carousel-slide">` blocks, all real stories supplied by you (Marcus Williams, Rebecca Miller, Robert Thompson, Jasmine Carter, Michael Anderson). To add another, copy one `<li class="carousel-slide">` block, give it `aria-label="6 of 6"` (and update the other labels to "x of 6"); the dots and arrows pick up the new slide automatically. If a photo is cropped badly, adjust its inline `object-position` (for example `50% 0%` keeps the top of the picture in view). A `.placeholder-badge` style is still in `styles.css` if you ever want to mark a draft card. Quotes sit in a `<blockquote>`, one `<p>` per paragraph, so longer stories work. Get written approval from each person before publishing their story and photo.

## Connect the contact form

The form is set up for **Web3Forms** (free plan, 250 messages a month; check [web3forms.com/pricing](https://web3forms.com/pricing) for current limits). It validates in the browser, then sends the message straight to **help@k9honorsociety.com**, with the visitor's email as the Reply-To address, so you can answer with one click.

**One step to switch it on:**

1. Go to [web3forms.com](https://web3forms.com), enter **help@k9honorsociety.com** and request an access key. It is emailed to that address.
2. Copy the key (it looks like `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).
3. In `script.js`, paste it into the `CONFIG` block at the top:
   ```js
   web3formsAccessKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   ```
4. Open the site, send yourself a test message, and check the inbox (and the spam folder the first time). If it landed in spam, mark it "not spam" so future messages arrive normally.

**Good to know**

- The key is public by design: anyone who views the page source can see it, and it only lets a page send a message to that one address. If you ever get unwanted messages, the Web3Forms dashboard lets you manage the key and its settings.
- **Until the key is pasted in,** the form still works: submitting opens the visitor's email app with the message already written and addressed to help@k9honorsociety.com. That is a fallback, though, because some visitors have no email app configured.
- **Spam:** a hidden honeypot field catches simple bots (their messages are dropped silently). If spam still gets through, add a free CAPTCHA such as Cloudflare Turnstile.
- **If sending fails** (wrong key, no connection, monthly limit reached), the visitor sees a message with your email address and phone number instead, so they can still reach you.
- The email contains the visitor's name, email, phone (or "Not provided"), whether they are a veteran, officer, family member or supporter, their branch or department, and the message.
- **Privacy:** the form collects personal details, so add a short privacy policy page and link it near the form.
- **Another service instead?** Leave `web3formsAccessKey` empty and set `formEndpoint` to that service's address (for example a Formspree form URL). It is used only when no Web3Forms key is set.

## Donate, Sponsor, Volunteer buttons

In the `CONFIG` block of `script.js`, set `donateUrl`, `sponsorUrl` and `volunteerUrl` (for example a PayPal, Stripe, Givebutter or Zeffy link). Until a URL is set, each button scrolls to the contact form with the right topic pre-selected.

## SEO

The head of `index.html` contains the title, description, canonical URL (`https://k9honorsociety.com/`), Open Graph and Twitter tags, and a schema.org **NGO** JSON-LD block (name, URL, email, telephone, and a contact point for Voskan Azaryan). After the site is live, submit `https://k9honorsociety.com/sitemap.xml` in Google Search Console.

## Deploying

Upload the folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, or standard web hosting) and point `k9honorsociety.com` at it. No server software is required.

## Optional: faster production CSS

The Tailwind CDN is convenient but generates CSS in the visitor's browser. For best speed, compile it once:

```bash
npm init -y && npm i -D tailwindcss@3
echo '@tailwind base; @tailwind components; @tailwind utilities;' > input.css
# create tailwind.config.js with content: ['./index.html', './script.js'] and copy the
# theme.extend colors/fontFamily from the <script> block in index.html's <head>
npx tailwindcss -i input.css -o tailwind.css --minify
```

Then replace the two `<script>` tags for Tailwind in `index.html` with `<link rel="stylesheet" href="tailwind.css">`.

## Accessibility notes

Skip link, semantic landmarks, keyboard-operable menu and carousel (arrow keys), visible focus rings, labelled form fields with linked error messages, `prefers-reduced-motion` support (animations are switched off), and text/background combinations chosen for WCAG AA contrast. Gold (`#C9A227`) is used for text only on navy; on light backgrounds the darker `#7A5F08` is used.

## Logo notes

- **Where it appears:** header (emblem plus the name as live text, so it stays sharp at any size), the footer (full logo on a white plate), the corner of the Our Mission photo, the Get in Touch card, and the browser-tab icon.
- **Light header, white footer plate:** the logo's lettering is dark green, which disappears on navy, so the header is light and the footer shows the logo on a white plate. If you want the logo directly on navy, you will need a light-coloured version of it.
- **The name:** the site now uses "K9 Honor Society" everywhere (page title, text, stories, form subject, JSON-LD `name`), to match the logo. The five stories are quotes, and the organization name inside them was changed too; make sure the people quoted are comfortable with that.
- **Colours:** the logo's greens (`--logo-green`, `--logo-olive` in `styles.css`) are not part of the navy, red and gold palette. You can add green accents to tie the site to the logo, or keep the logo as it is.

## Credits

The logo is the artwork you chose (originals in `logo/chosen/`). Please confirm you hold the rights to use it. The `logo/` folder also holds two earlier concepts I drew (a dog with a bandana, and a person petting a dog) in case you want them later. Placeholder photos are from [Unsplash](https://unsplash.com) (free to use under the Unsplash License); replace them with your own photography before launch.
