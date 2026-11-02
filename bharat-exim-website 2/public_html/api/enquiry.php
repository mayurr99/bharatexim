<?php
/**
 * Bharat Exim Traders — enquiry handler
 *
 * Location on Hostinger:  public_html/api/enquiry.php   (public, this file)
 * Secrets/config:         ~/private/enquiry-config.php   (OUTSIDE public_html, never served)
 *
 * The browser never sees the config. Only sanitised results are returned.
 */
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, max-age=0');
header('Referrer-Policy: same-origin');

$wantsJson = str_contains(strtolower($_SERVER['HTTP_ACCEPT'] ?? ''), 'application/json');

const FALLBACK = 'We could not send your enquiry just now. Please call +91 91302 16056 or email bharateximtraders@gmail.com.';

function reply(bool $json, int $status, array $payload, ?string $redirect = null): void
{
    if (!$json && $redirect !== null && $status === 200) {
        header('Location: ' . $redirect, true, 303);
        exit;
    }
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// ---------- 1. Load private config (fail closed) -------------------------------
$configFile = dirname(__DIR__, 2) . '/private/enquiry-config.php';
if (!is_readable($configFile)) {
    error_log('enquiry: private config missing at ' . $configFile);
    reply($wantsJson, 500, ['ok' => false, 'message' => FALLBACK]);
}
$cfg = require $configFile;
$logDir = rtrim((string)$cfg['private_dir'], '/');

// ---------- 2. Method, size and origin checks ---------------------------------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    reply(true, 405, ['ok' => false, 'message' => 'Method not allowed.']);
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) {
    reply($wantsJson, 413, ['ok' => false, 'message' => 'Your message is too large. Please shorten it.']);
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $host = parse_url($origin, PHP_URL_HOST) ?: '';
    $port = parse_url($origin, PHP_URL_PORT);
    $hostPort = $host . ($port ? ':' . $port : '');
    if (!in_array($hostPort, $cfg['allowed_hosts'], true)) {
        reply(true, 403, ['ok' => false, 'message' => 'Request origin not allowed.']);
    }
}

// ---------- 3. Rate limiting (hashed IP, keyed with a private salt) -----------
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$rlDir = $logDir . '/ratelimit';
if (!is_dir($rlDir)) {
    @mkdir($rlDir, 0700, true);
}
$now = time();
$window = (int)$cfg['rate_limit']['window'];
$max = (int)$cfg['rate_limit']['max'];
$rlFile = $rlDir . '/' . hash_hmac('sha256', $ip, (string)$cfg['salt']) . '.json';
$hits = [];
if (is_file($rlFile)) {
    $decoded = json_decode((string)file_get_contents($rlFile), true) ?: [];
    $hits = array_values(array_filter($decoded, static fn($t) => is_int($t) && $t > $now - $window));
}
if (count($hits) >= $max) {
    reply(true, 429, ['ok' => false, 'message' => 'Too many enquiries from this connection. Please try again in a few minutes.']);
}
$hits[] = $now;
file_put_contents($rlFile, json_encode($hits), LOCK_EX);

// ---------- 4. Spam traps: honeypot + minimum fill time -----------------------
$json = $wantsJson;
$fakeOk = ['ok' => true, 'message' => 'Thank you. Your enquiry has been received.'];
if (trim((string)($_POST['website'] ?? '')) !== '') {
    reply($json, 200, $fakeOk, '../contact.html?sent=1'); // silently drop bots
}
$started = (int)($_POST['form_started'] ?? 0);
if ($started > 0 && ($now - $started < 3 || $now - $started > 86400)) {
    reply($json, 200, $fakeOk, '../contact.html?sent=1');
}

// ---------- 5. Validate and sanitise -----------------------------------------
$categories = [
    'clothing'        => 'Women’s Clothing & Apparel',
    'spices'          => 'Indian Spices (Whole & Ground)',
    'dog-accessories' => 'Canine Accessories & Pet Gear',
    'multiple'        => 'Multiple Categories',
    'documentation'   => 'Documentation & Compliance',
];

// Single-line fields: strip every control character (blocks header injection)
$line = static fn(string $v): string => trim((string)preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v));
// Multi-line message: keep newlines, strip other control characters
$text = static fn(string $v): string => trim((string)preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/u', '', str_replace("\r\n", "\n", $v)));

$name        = $line((string)($_POST['name'] ?? ''));
$company     = $line((string)($_POST['company'] ?? ''));
$email       = $line((string)($_POST['email'] ?? ''));
$phone       = $line((string)($_POST['phone'] ?? ''));
$category    = $line((string)($_POST['category'] ?? ''));
$destination = $line((string)($_POST['destination'] ?? ''));
$message     = $text((string)($_POST['message'] ?? ''));

$errors = [];
// Count characters without requiring the mbstring extension
$len = static fn(string $s): int => (int)preg_match_all('/./us', $s);

if ($len($name) < 2 || $len($name) > 100) {
    $errors['name'] = 'Please enter your full name (2–100 characters).';
}
if (strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    $errors['email'] = 'Please enter a valid email address.';
}
if ($phone !== '' && !preg_match('/^\+?[0-9 ()\-]{7,20}$/', $phone)) {
    $errors['phone'] = 'Please enter a valid phone number, including country code.';
}
if (!isset($categories[$category])) {
    $errors['category'] = 'Please choose a product category.';
}
if ($len($company) > 120) {
    $errors['company'] = 'Company name must be 120 characters or fewer.';
}
if ($len($destination) > 100) {
    $errors['destination'] = 'Destination must be 100 characters or fewer.';
}
if ($len($message) < 10 || $len($message) > 3000) {
    $errors['message'] = 'Please describe your requirements (10–3000 characters).';
}
if ($errors) {
    reply($json, 422, ['ok' => false, 'errors' => $errors, 'message' => 'Please correct the highlighted fields.']);
}

// ---------- 6. Compose and send ----------------------------------------------
$categoryLabel = $categories[$category];
$from = $cfg['from_address'];
$subject = '=?UTF-8?B?' . base64_encode("[Website enquiry] {$categoryLabel} — {$name}") . '?=';
$body = implode("\n", [
    "New trade enquiry from the Bharat Exim Traders website",
    str_repeat('-', 50),
    "Name:        {$name}",
    "Company:     " . ($company ?: 'N/A'),
    "Email:       {$email}",
    "Phone:       " . ($phone ?: 'N/A'),
    "Category:    {$categoryLabel}",
    "Destination: " . ($destination ?: 'Not specified'),
    str_repeat('-', 50),
    "Requirements:",
    $message,
    str_repeat('-', 50),
    "Submitted: " . gmdate('Y-m-d H:i:s') . " UTC",
]);
$headers = implode("\r\n", [
    "From: Bharat Exim Website <{$from}>",
    "Reply-To: {$email}",
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: BharatExim-Website',
]);

if (!empty($cfg['dry_run'])) {
    // Staging mode: write the enquiry to a private file instead of emailing.
    file_put_contents($logDir . '/enquiry-outbox.log', "=== " . date('c') . "\n{$subject}\n{$body}\n\n", FILE_APPEND | LOCK_EX);
    $sent = true;
} else {
    $sent = mail($cfg['recipient'], $subject, $body, $headers);
}

if (!$sent) {
    @file_put_contents($logDir . '/enquiry-errors.log', '[' . date('c') . "] mail() failed\n", FILE_APPEND | LOCK_EX);
    reply($json, 500, ['ok' => false, 'message' => FALLBACK]);
}

// Confirmation to the visitor (best effort; failure does not fail the enquiry)
if (!empty($cfg['send_autoreply']) && empty($cfg['dry_run'])) {
    $firstName = explode(' ', $name)[0];
    $autoSubject = '=?UTF-8?B?' . base64_encode('We received your enquiry — Bharat Exim Traders') . '?=';
    $autoBody = "Dear {$firstName},\n\nThank you for your enquiry about {$categoryLabel}. "
        . "Our founder, Prajakta Tambat, will review your requirements and reply to this email address.\n\n"
        . "Bharat Exim Traders\nNashik, Maharashtra, India\n+91 91302 16056";
    $autoHeaders = implode("\r\n", [
        "From: Bharat Exim Traders <{$from}>",
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ]);
    @mail($email, $autoSubject, $autoBody, $autoHeaders);
}

$first = explode(' ', $name)[0];
reply($json, 200, [
    'ok' => true,
    'message' => "Thank you, {$first}. Your enquiry has been sent. We will reply to {$email} soon.",
], '../contact.html?sent=1');
