const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const Farmer = require("../models/Farmer");
const Admin = require("../models/Admin");

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// Helper to route to correct collection
const getModelByRole = (role) => {
  if (role === 'farmer') return Farmer;
  if (role === 'admin') return Admin;
  return Customer;
};

/* ---------------- REGISTER ---------------- */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, image } = req.body;
    
    const targetRole = role || 'customer';
    const Model = getModelByRole(targetRole);

    const exists = await Model.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "An account already exists with this email for this role" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Model.create({
      name,
      email,
      password: hashedPassword,
      role: targetRole,
      image: image || "",
      phone: "",
      address: "",
      ...(targetRole !== 'admin' && { bio: "", specialization: "" })
    });

    const token = signToken(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      phone: user.phone,
      address: user.address,
      bio: user.bio,
      specialization: user.specialization,
      verified: user.verified || false,
      verificationStatus: user.verificationStatus || 'Unverified',
      documents: user.documents || {},
      token,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


/* ---------------- LOGIN ---------------- */
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    const targetRole = role || 'customer';
    const Model = getModelByRole(targetRole);

    const user = await Model.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials or wrong role selected" });
    }

    let isMatch = false;
    const isBcryptHash = user.password.startsWith("$2");
    if (isBcryptHash) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = user.password === password;
      if (isMatch) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      phone: user.phone,
      address: user.address,
      bio: user.bio,
      specialization: user.specialization,
      verified: user.verified || false,
      verificationStatus: user.verificationStatus || 'Unverified',
      documents: user.documents || {},
      token,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


/* ---------------- UPDATE USER ---------------- */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    const targetRole = req.body.role || 'customer';
    const Model = getModelByRole(targetRole);

    const updateFields = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      bio: req.body.bio,
      specialization: req.body.specialization,
      image: req.body.image,
    };

    const updatedUser = await Model.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found within their role collection" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


/* ---------------- GET USERS ---------------- */
exports.getUsers = async (req, res) => {
  try {
    const filter = {};
    const targetRole = req.query.role || "customer";
    if (req.query.role) filter.role = req.query.role;

    const Model = getModelByRole(targetRole);
    const users = await Model.find(filter).select("-password");
    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


/* ---------------- FIREBASE / GOOGLE AUTH ---------------- */
exports.firebaseAuth = async (req, res) => {
  try {
    const { firebaseUid, name, email, role, image } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ message: "firebaseUid and email are required" });
    }

    const targetRole = role || "customer";
    const Model = getModelByRole(targetRole);

    // 1. Check if user already exists by firebaseUid or email in their specific role collection
    let user = await Model.findOne({ $or: [{ firebaseUid }, { email }] });

    if (user) {
        if (!user.firebaseUid) {
            user.firebaseUid = firebaseUid;
        }
        if (image && !user.image) {
            user.image = image;
        }
        await user.save();
    } else {
      // 3. If not found, create new user in the specific role collection
      user = await Model.create({
        firebaseUid,
        name: name || "User",
        email,
        password: "",  // No password for Google-auth users
        role: targetRole,
        image: image || "",
        phone: "",
        address: "",
        ...(targetRole !== 'admin' && { bio: "", specialization: "" })
      });
    }

    const token = signToken(user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      phone: user.phone,
      address: user.address,
      bio: user.bio,
      specialization: user.specialization,
      verified: user.verified || false,
      verificationStatus: user.verificationStatus || 'Unverified',
      documents: user.documents || {},
      token,
    });
  } catch (err) {
    console.error("FIREBASE AUTH ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};