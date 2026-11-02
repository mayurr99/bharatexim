<?php
/**
 * PRIVATE CONFIG TEMPLATE — copy to ~/private/enquiry-config.php on Hostinger.
 * This file must NEVER be inside public_html or committed to git.
 * Fill in values on the server only; do not paste real secrets anywhere else.
 */
return [
    // Where enquiries are delivered
    'recipient'      => 'bharateximtraders@gmail.com',

    // Sender address. Use an address on YOUR domain (create it in hPanel > Emails),
    // otherwise mail is likely to land in spam.
    'from_address'   => 'no-reply@bharateximtraders.com',

    // Hosts allowed to submit the form (protects against cross-site posting)
    'allowed_hosts'  => ['bharateximtraders.com', 'www.bharateximtraders.com'],

    // Max enquiries per connection per window (seconds)
    'rate_limit'     => ['max' => 5, 'window' => 600],

    // Private folder for rate-limit data and logs (outside public_html)
    'private_dir'    => __DIR__,

    // Send a confirmation email to the visitor
    'send_autoreply' => true,

    // true = write enquiries to a private log instead of emailing (use while testing)
    'dry_run'        => false,

    // Long random string used to hash IP addresses. Generate with: openssl rand -hex 32
    'salt'           => 'REPLACE_WITH_OUTPUT_OF_openssl_rand_-hex_32',
];
