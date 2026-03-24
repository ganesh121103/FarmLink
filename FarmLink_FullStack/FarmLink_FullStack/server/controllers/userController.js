const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Customer");

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

/* ---------------- REGISTER ---------------- */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, image } = req.body;

    const exists = await User.findOne({ email, role });
    if (exists) {
      return res.status(400).json({ message: "User already exists with this role" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",
      image: image || "",
      phone: "",
      address: "",
      bio: "",
      specialization: "",
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

    // Find user by email AND role so each role is treated separately
    const user = await User.findOne({ email, role: role || "customer" });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials or wrong role selected" });
    }

    // Support both bcrypt hashes (new users) and plain-text (legacy users)
    let isMatch = false;
    const isBcryptHash = user.password.startsWith("$2");
    if (isBcryptHash) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plain-text comparison + upgrade hash on the fly
      isMatch = user.password === password;
      if (isMatch) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials or wrong role selected" });
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

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        bio: req.body.bio,
        specialization: req.body.specialization,
        image: req.body.image,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
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
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};