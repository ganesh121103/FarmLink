const Product = require("../models/Product");

/* ════════════════════════════════════════════════════════════════
   Auto-delete expired products (runs every hour)
   Products with expiresAt < now are automatically removed.
   ════════════════════════════════════════════════════════════════ */
const startExpiryCleanupJob = () => {
  const runCleanup = async () => {
    try {
      const result = await Product.deleteMany({
        expiresAt: { $ne: null, $lt: new Date() }
      });
      if (result.deletedCount > 0) {
        console.log(`🗑️  [Auto-Cleanup] Deleted ${result.deletedCount} expired product(s).`);
      }
    } catch (err) {
      console.error("❌ [Auto-Cleanup] Failed:", err.message);
    }
  };

  // Run immediately on startup, then every hour
  runCleanup();
  setInterval(runCleanup, 60 * 60 * 1000); // every 1 hour
  console.log("⏰ [Auto-Cleanup] Expired product cleanup job started (runs every hour).");
};

module.exports = { startExpiryCleanupJob };
