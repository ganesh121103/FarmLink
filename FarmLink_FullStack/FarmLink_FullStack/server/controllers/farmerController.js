const Farmer = require("../models/Farmer");

/* ---------------- GET ALL FARMERS ---------------- */
exports.getFarmers = async (req, res) => {
  try {
    const filter = { role: 'farmer' };
    if (req.query.status) filter.verificationStatus = req.query.status;

    const farmers = await Farmer.find(filter).select('-password');
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- UPLOAD DOCUMENTS ---------------- */
exports.uploadDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { idProof, landRecord } = req.body;

    let farmer = await Farmer.findById(id);
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }
    
    farmer.documents = {
      idProof: idProof || farmer.documents?.idProof,
      landRecord: landRecord || farmer.documents?.landRecord
    };
    farmer.verificationStatus = "Pending";
    await farmer.save();
    
    return res.json({ message: "Documents uploaded successfully", farmer });
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

    const farmer = await Farmer.findByIdAndUpdate(
      id,
      { verified: approve, verificationStatus: newStatus },
      { new: true }
    );

    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    res.json({
      message: approve ? "Farmer verified successfully" : "Farmer verification rejected",
      farmer
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
