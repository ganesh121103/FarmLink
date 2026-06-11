const nodemailer = require("nodemailer");
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// Force IPv4 in Node 18+ to prevent ENETUNREACH IPv6 connection issues on Render
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const logEmail = (msg) => {
    try {
        const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
        fs.appendFileSync(path.join(__dirname, '../email.log'), logMsg);
        console.log(msg);
    } catch(e) {}
};

const logEmailError = (msg, err) => {
    try {
        const logMsg = `[${new Date().toISOString()}] ERROR: ${msg} | ${err?.message} | Stack: ${err?.stack}\n`;
        fs.appendFileSync(path.join(__dirname, '../email.log'), logMsg);
        console.error(msg, err);
    } catch(e) {}
};

let transporter;

const initTransporter = async () => {
    if (transporter) return true;

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
        logEmail("⚠️ Gmail SMTP disabled: GMAIL_USER or GMAIL_APP_PASS missing in .env.");
        return false;
    }

    try {
        transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // Use STARTTLS on port 587
            requireTLS: true, // Force TLS
            family: 4, // Force IPv4 to prevent ENETUNREACH
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASS,
            },
            tls: {
                rejectUnauthorized: true,
            },
            pool: true,              // reuse connections
            maxConnections: 3,
            connectionTimeout: 10000, // 10s to establish connection
            greetingTimeout: 8000,   // 8s for SMTP greeting
            socketTimeout: 15000,    // 15s for socket inactivity
        });

        await transporter.verify();
        logEmail(`✅ Gmail SMTP connection verified for: ${process.env.GMAIL_USER}`);
        return true;
    } catch(err) {
        logEmailError("Failed to verify SMTP connection", err);
        transporter = null;
        return false;
    }
};

/**
 * Wraps content in a branded FarmLink HTML email template.
 */
const buildHtmlEmail = (subject, innerHtml) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
  <style>
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f5f7f0;margin:0;padding:0;}
    .wrapper{max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);}
    .header{background:linear-gradient(135deg,#2d6a4f,#52b788);padding:28px 32px;text-align:center;}
    .header h1{color:#fff;margin:0;font-size:26px;letter-spacing:1px;}
    .header p{color:#d8f3dc;margin:4px 0 0;font-size:13px;}
    .body{padding:32px;color:#1b2a1e;font-size:15px;line-height:1.7;}
    .body h2{color:#2d6a4f;margin-top:0;}
    .highlight-box{background:#d8f3dc;border-left:4px solid #52b788;border-radius:6px;padding:14px 18px;margin:20px 0;font-size:14px;}
    .footer{background:#f0f4ee;text-align:center;padding:18px;font-size:12px;color:#888;}
    .footer a{color:#52b788;text-decoration:none;}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🌱 FarmLink</h1>
      <p>Connecting Farmers &amp; Customers</p>
    </div>
    <div class="body">
      ${innerHtml}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} FarmLink. All rights reserved.<br/>
      <a href="#">Privacy Policy</a>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Send an email via Gmail SMTP.
 * @param {string} to       - Recipient email address
 * @param {string} subject  - Email subject line
 * @param {string} bodyHtml - HTML body (plain text is auto-wrapped in FarmLink template)
 */
const sendEmail = async (to, subject, bodyHtml) => {
    const isReady = await initTransporter();

    try {
        if (!to) {
            console.warn("⚠️ sendEmail: No recipient provided.");
            return false;
        }

        const fromEmail = `FarmLink <${process.env.GMAIL_USER}>`;

        // Auto-wrap if not already a full HTML document
        const isFullHtml = typeof bodyHtml === "string" && bodyHtml.trim().toLowerCase().startsWith("<!doctype");
        const finalHtml = isFullHtml ? bodyHtml : buildHtmlEmail(subject, `<p>${bodyHtml}</p>`);

        if (!isReady || !transporter) {
            logEmail(`❌ SMTP transporter unavailable. To: ${to} | Subject: ${subject}`);
            return false;
        }

        logEmail(`📤 Sending email → ${to} | Subject: "${subject}"`);
        const info = await transporter.sendMail({
            from: fromEmail,
            to,
            subject,
            html: finalHtml,
        });

        logEmail(`✅ Email sent successfully: ${info.messageId}`);
        return true;
    } catch (err) {
        const code = err.code || '';
        logEmailError(`❌ Email dispatch failed [${code}] for ${to}`, err);

        if (['EAUTH', 'ECONNECTION', 'ECONNRESET', 'ETIMEDOUT'].includes(code)) {
            logEmail("⚠️ Resetting SMTP transporter due to connection error.");
            if (transporter) { transporter.close(); }
            transporter = null;
        }

        return false;
    }
};

module.exports = { sendEmail, buildHtmlEmail };
