const Farmer = require("../models/Farmer");
const Customer = require("../models/Customer");

/* ---------------- GET ALL FARMERS ---------------- */
exports.getFarmers = async (req, res) => {
  try {
    const filter = { role: 'farmer' };
    if (req.query.status) filter.verificationStatus = req.query.status;

    // Try Farmer collection first (has documents & verificationStatus)
    let farmers = await Farmer.find(filter).select('-password');

    // Also get farmer-role users from Customer collection (registered via AuthView)
    const customerFarmers = await Customer.find({ role: 'farmer' }).select('-password');

    // Merge: prefer Farmer doc if exists, otherwise use Customer record
    const farmerEmails = new Set(farmers.map(f => f.email));
    const extra = customerFarmers.filter(c => !farmerEmails.has(c.email));
    const merged = [...farmers, ...extra];

    res.json(merged);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- UPLOAD DOCUMENTS ---------------- */
exports.uploadDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { idProof, landRecord } = req.body;

    // Try the dedicated Farmer collection first
    let farmer = await Farmer.findById(id);
    if (farmer) {
      farmer.documents = {
        idProof: idProof || farmer.documents?.idProof,
        landRecord: landRecord || farmer.documents?.landRecord
      };
      farmer.verificationStatus = "Pending";
      await farmer.save();
      return res.json({ message: "Documents uploaded successfully", farmer });
    }

    // Farmer is in the Customer collection (registered via the unified AuthView)
    const customer = await Customer.findById(id);
    if (!customer || customer.role !== 'farmer') {
      return res.status(404).json({ message: "Farmer not found" });
    }

    customer.verificationStatus = "Pending";
    customer.documents = {
      idProof: idProof || customer.documents?.idProof,
      landRecord: landRecord || customer.documents?.landRecord
    };
    await customer.save();

    return res.json({ message: "Documents uploaded successfully", farmer: customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- VERIFY FARMER ---------------- */
exports.verifyFarmer = async (req, res) => {
  try {
    const { id } = req.params;
    const { approve } = req.body;
    const newStatus = approve ? "Verified" : "Rejected";

    // Update in Farmer collection (if exists)
    let farmer = await Farmer.findByIdAndUpdate(
      id,
      { verified: approve, verificationStatus: newStatus },
      { new: true }
    );

    // Also update in Customer collection (for farmers who registered via AuthView)
    await Customer.findByIdAndUpdate(
      id,
      { verified: approve, verificationStatus: newStatus }
    );

    // If not in Farmer collection, try Customer collection
    if (!farmer) {
      const customer = await Customer.findById(id);
      if (!customer) return res.status(404).json({ message: "Farmer not found" });
      farmer = customer;
    }

    res.json({
      message: approve ? "Farmer verified successfully" : "Farmer verification rejected",
      farmer
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
