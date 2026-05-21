const cron = require('node-cron');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const { sendEmail, buildHtmlEmail } = require('../services/emailService');
const { sendPushNotification } = require('../services/pushNotificationService');

// Configurable Settings
const LOW_STOCK_THRESHOLD = 5;
const EXPIRY_HOURS_THRESHOLD = 48;

/**
 * Main routine that scans products and wishlists, and triggers alerts.
 */
const checkWishlistAlerts = async () => {
    try {
        console.log("🔍 [Cron] Starting wishlist alerts check...");

        // 1. Find all products that meet our alert criteria
        const now = new Date();
        const twoDaysFromNow = new Date(now.getTime() + EXPIRY_HOURS_THRESHOLD * 60 * 60 * 1000);
        
        const flaggedProducts = await Product.find({
            $or: [
                { stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } },
                { expiresAt: { $ne: null, $lt: twoDaysFromNow, $gt: now } }
            ]
        });

        if (flaggedProducts.length === 0) {
            console.log("✅ [Cron] No wishlist products flagged for alerts.");
            return;
        }

        // Create a lookup for flagged products
        const flaggedMap = new Map();
        flaggedProducts.forEach(p => {
             const isLowStock = p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD;
             const isNearExpiry = p.expiresAt && p.expiresAt < twoDaysFromNow && p.expiresAt > now;
             flaggedMap.set(p._id.toString(), { product: p, isLowStock, isNearExpiry });
        });

        const flaggedIds = Array.from(flaggedMap.keys());

        // 2. Find all customers who have ANY of these products in their wishlist
        const customers = await Customer.find({ wishlist: { $in: flaggedIds } });

        let alertsSent = 0;

        // 3. For each customer, check if an alert should be sent
        for (const customer of customers) {
            for (const productId of customer.wishlist) {
                const flaggedInfo = flaggedMap.get(productId.toString());
                if (!flaggedInfo) continue;

                const { product, isLowStock, isNearExpiry } = flaggedInfo;

                // Build reason strings
                let alertReason = [];
                if (isLowStock) alertReason.push(`Only ${product.stock} items left in stock`);
                if (isNearExpiry) {
                     const daysLeft = Math.max(1, Math.ceil((new Date(product.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                     alertReason.push(`Expires in ${daysLeft} day(s)`);
                }

                if (alertReason.length === 0) continue;
                
                const messageStr = `A product on your wishlist (${product.name}) needs your attention: ${alertReason.join(' & ')}.`;
                const titleStr = "Wishlist Alert! 🛒";

                // Check 24-hour duplication
                const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const existingNotification = await Notification.findOne({
                    userId: customer._id,
                    link: product._id.toString(),
                    type: "Wishlist",
                    createdAt: { $gte: twentyFourHoursAgo }
                });

                if (existingNotification) {
                    continue; // Already alerted for this product in past 24h
                }

                // --- Dispatch Alerts ---

                // A) Database Notification
                await Notification.create({
                    userId: customer._id,
                    title: titleStr,
                    message: messageStr,
                    image: product.image || "",
                    link: product._id.toString(),
                    type: "Wishlist"
                });

                // B) Push Notification
                if (customer.fcmToken) {
                    await sendPushNotification(customer.fcmToken, titleStr, messageStr, {
                        type: "Wishlist",
                        link: product._id.toString()
                    });
                }

                // C) Email Alert
                if (customer.email) {
                    const htmlContent = buildHtmlEmail(
                        titleStr,
                        `<h2>${titleStr}</h2>
                         <p>Hi <strong>${customer.name || 'there'}</strong>,</p>
                         <p>We're writing to let you know that a product on your FarmLink wishlist needs your attention.</p>
                         <div class="highlight-box">
                             <strong>Product:</strong> ${product.name}<br/>
                             <strong>Farmer:</strong> ${product.farmerName}<br/>
                             <strong>Status:</strong> <span style="color:#e63946;font-weight:bold;">${alertReason.join(' & ')}</span>
                         </div>
                         <p>Don't miss out! Log in to FarmLink to grab it before it's gone.</p>`
                    );
                    await sendEmail(customer.email, `FarmLink Wishlist Alert: ${product.name}`, htmlContent);
                }

                alertsSent++;
            }
        }

        console.log(`✅ [Cron] Wishlist alerts finished. Sent ${alertsSent} alert(s) today.`);

    } catch (err) {
        console.error("❌ [Cron] Wishlist alerts failed:", err.message);
    }
};

/**
 * Initializes the wishlist background cron job
 */
const startWishlistAlertJob = () => {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', checkWishlistAlerts);
    console.log("⏰ [Wishlist Cron] Initialized low-stock and expiry background job (runs hourly).");
    
    // Optional: Also run once on startup for debugging/instant execution
    // setTimeout(() => checkWishlistAlerts(), 5000);
};

module.exports = { startWishlistAlertJob, checkWishlistAlerts };
