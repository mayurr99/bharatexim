# Deploying Bharat Exim Traders on Hostinger

This guide covers connecting your custom domain, uploading the site, turning on
the enquiry form, keeping secrets private, and a security checklist.

Menu names in hPanel change from time to time. If a label differs, search the
hPanel help centre for the same task.

---------------------------------------------------------------------------
## 1. Hosting plan
Use a Hostinger **Website / Business** plan (shared hosting with PHP and hPanel).
The enquiry form needs PHP, which these plans include. Check that PHP is 8.1 or newer:
hPanel → **Websites** → your site → **PHP Configuration** (or **Advanced → PHP**).

---------------------------------------------------------------------------
## 2. Connect your custom domain (bharateximtraders.com)

### Case A: the domain was bought from Hostinger
1. Open **hPanel → Domains** and check that `bharateximtraders.com` is listed.
2. Open **Websites → Add Website** (or **Manage** on an existing website) and
   choose the domain. Hostinger links the domain to the website automatically.

### Case B: the domain was bought somewhere else (GoDaddy, Namecheap, etc.)
1. In **hPanel → Domains → Add domain**, choose **Use a domain I already own**, and enter `bharateximtraders.com`.
2. Hostinger shows its **nameservers**. Copy them exactly as displayed (do not use
   examples from other guides).
3. Log in to your current registrar, open the domain's **DNS / Nameservers**
   settings, choose **custom nameservers**, and paste the two Hostinger nameservers.
4. Wait for propagation. This usually takes minutes to a few hours, and up to 48 hours
   in rare cases. Check progress at whatsmydns.net by entering the domain.
5. Back in hPanel, the domain status changes to **Active** when it is connected.

### Add the www version
In **hPanel → Domains → DNS / Zone**, make sure `www` points to the same website, or
add a redirect from `www` to the main domain so both addresses resolve to one site.

---------------------------------------------------------------------------
## 3. Upload the website
1. **hPanel → Files → File Manager** → open `public_html`.
2. Delete the default placeholder file (`default.php` or similar) if present.
3. Upload the **contents** of the `bharat-exim-website` folder into `public_html`,
   so `index.html` sits directly inside `public_html`. Include the hidden `.htaccess`
   file (enable "Show hidden files" in File Manager settings).
4. The final layout should look like this:

```
public_html/
  .htaccess
  index.html  about.html  contact.html  ...
  style.css  enhance.css  app.js  contact-form.js  fonts.css
  assets/
  api/
    enquiry.php
```

Open `https://bharateximtraders.com` to confirm the homepage loads.

---------------------------------------------------------------------------
## 4. Turn on HTTPS (free SSL)
1. **hPanel → Websites → Manage → SSL** → install the **free SSL certificate** for
   the domain and the `www` version. Wait a few minutes.
2. The `.htaccess` file already forces HTTPS. Confirm that `http://` redirects to
   `https://` after the certificate is active.

---------------------------------------------------------------------------
## 5. Set up the enquiry email (secrets stay on the server)

The form emails enquiries through PHP's `mail()` function. Secrets are kept in a
file **outside** `public_html`, so visitors can never download it.

### 5a. Create a sender mailbox on your domain
1. **hPanel → Emails → Email Accounts → Create** → `no-reply@bharateximtraders.com`.
   This is the sender address. Visitors reply to the enquirer's address, not this one.
2. Set up SPF, DKIM and DMARC records (hPanel → Emails shows the recommended records,
   and they are usually added automatically when the domain uses Hostinger DNS).
   These records stop enquiry emails going to spam.

### 5b. Create the private config
1. In **File Manager**, go to your **home folder** (one level above `public_html`).
2. Create a folder named `private`.
3. Upload `private/enquiry-config.example.php` into it, and **rename it to
   `enquiry-config.php`**.
4. Edit `enquiry-config.php` in the File Manager editor:
   - `recipient` → the inbox that should receive enquiries.
   - `from_address` → the mailbox from step 5a.
   - `allowed_hosts` → keep `bharateximtraders.com` and `www.bharateximtraders.com`.
   - `salt` → replace the placeholder with a long random string (see below).
   - `dry_run` → leave `false` for live use. Set it to `true` only while testing; enquiries are then written to a private log and not emailed.
5. Generate the salt in hPanel's **Terminal** (if available), or use any password
   generator to create a 64-character random string, and paste it in.
6. Set the file permissions of `enquiry-config.php` to **600** (or 640 if 600 is not
   allowed) by right-clicking it in File Manager → **Permissions**.

Important: `enquiry-config.php` must never be placed inside `public_html`, and must
never be shared, emailed or committed to a code repository.

### 5c. Test the form
1. Open `https://bharateximtraders.com/contact.html`, fill in the form and submit.
2. You should see **"Enquiry received"** on the page, and the enquiry should arrive in
   the recipient inbox. A confirmation also goes to the address you entered.
3. If nothing arrives, check spam folders, then check **hPanel → Emails → Logs**. The file
   `~/private/enquiry-errors.log` records failed sends (view it in File Manager).
4. When testing is finished, make sure `dry_run` is `false`.

---------------------------------------------------------------------------
## 6. Security checklist

| Item | What to do | Status in the package |
|---|---|---|
| HTTPS everywhere | Install SSL, keep the redirect in `.htaccess` | Done (redirect + HSTS) |
| Security headers | CSP, X-Frame-Options, nosniff, referrer and permissions policies | Done (`.htaccess`) |
| No directory browsing | `Options -Indexes` | Done |
| Sensitive files blocked | `.env`, logs, config, markdown files return 403 | Done |
| Secrets off the web | Config and logs live in `~/private`, outside `public_html` | Done (you upload the config) |
| No secrets in browser code | Form sends only the visitor's data; the salt and recipient are server-side | Done |
| Spam protection | Honeypot, minimum fill time, rate limit, origin check | Done (`api/enquiry.php`) |
| Input validation and header-injection protection | Server-side validation, control characters removed | Done |
| Strong passwords and 2FA | Enable two-factor login on your Hostinger account and email account | **You** |
| Keep PHP current | Use PHP 8.1+ in hPanel | **You** |
| Backups | hPanel → **Backups** (enable at least weekly) | **You** |
| Remove test data | Delete `private/enquiry-outbox.log` after testing | **You** |

Note on hardening: the Content Security Policy blocks inline scripts. If you later add
scripts from other providers (e.g. analytics), add their domain to the policy in
`.htaccess` at the same time, or the script will be blocked.

---------------------------------------------------------------------------
## 7. Verify before going live
- [ ] `https://bharateximtraders.com` loads with a padlock, and `http://` redirects to `https://`.
- [ ] `https://bharateximtraders.com/private/` and `/api/enquiry.php` (GET) do not show file contents.
- [ ] A test enquiry arrives in the inbox, and the confirmation arrives at the test address.
- [ ] `dry_run` is `false` in `~/private/enquiry-config.php`.
- [ ] The mobile menu opens and closes on a phone.
- [ ] Each page shows the correct title in the browser tab, and `sitemap.xml` is reachable at `/sitemap.xml`.
- [ ] Submit Google Search Console for the domain and upload `sitemap.xml`.

## What could not be tested here
The package was tested on a local PHP server, which does not run `.htaccess` and does not
send real email. Test the domain connection, SSL, redirects and email delivery on Hostinger
itself, using the checklist above.
