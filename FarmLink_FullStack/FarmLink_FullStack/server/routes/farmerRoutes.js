const express = require("express");
const router = express.Router();

const {
  getFarmers,
  uploadDocuments,
  verifyFarmer
} = require("../controllers/farmerController");

// GET /api/farmers - Admin fetches all farmers with verification status & documents
router.get("/", getFarmers);

// PUT /api/farmers/:id/documents - Farmer uploads their verification documents
router.put("/:id/documents", uploadDocuments);

// PUT /api/farmers/:id/verify - Admin verifies or rejects a farmer
router.put("/:id/verify", verifyFarmer);

module.exports = router;
