const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Customer = require("../models/Customer");
const Farmer = require("../models/Farmer");
const Admin = require("../models/Admin");
const { sendEmail, buildHtmlEmail } = require("../utils/emailService");

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
    let { name, email, password, role, image, phone, fcmToken } = req.body;
    
    // Server-side Indian Phone Validation
    if (phone) {
        const cleanPhone = phone.replace(/[\-\s]/g, '');
        const indianPhoneRegex = /^(?:\+91|91)?(?:[6789]\d{9})$/;
        if (!indianPhoneRegex.test(cleanPhone)) {
             return res.status(400).json({ message: "Invalid Indian phone number format" });
        }
        // Normalize to +91
        phone = cleanPhone.startsWith('+91') ? cleanPhone : 
                cleanPhone.startsWith('91') && cleanPhone.length === 12 ? '+' + cleanPhone : 
                '+91' + cleanPhone;
    }

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
      phone: phone || "",
      address: "",
      fcmToken: fcmToken || "",
      ...(targetRole !== 'admin' && { bio: "", specialization: "" })
    });

    const token = signToken(user);

    // ✅ Send welcome email (non-blocking)
    setImmediate(async () => {
      try {
        const welcomeHtml = buildHtmlEmail(
          `Welcome to FarmLink, ${name}!`,
          `
            <h2>Welcome to FarmLink! 🌱</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your account has been created successfully. You can now browse fresh produce directly from local farmers.</p>
            <div class="highlight-box">
              <strong>Your Account Details:</strong><br/>
              Email: ${email}<br/>
              Role: ${targetRole.charAt(0).toUpperCase() + targetRole.slice(1)}
            </div>
            <p>Start exploring and support local farmers today!</p>
            <p style="color:#888;font-size:13px;">If you did not create this account, please ignore this email.</p>
          `
        );
        await sendEmail(email, `Welcome to FarmLink, ${name}! 🌱`, welcomeHtml);
      } catch (e) {
        console.error("[Welcome Email] Failed:", e.message);
      }
    });

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
    const { email, password, role, fcmToken } = req.body;
    
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
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (fcmToken) {
        user.fcmToken = fcmToken;
    }
    await user.save();

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
    const { fcmToken } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    let phone = req.body.phone;
    if (phone) {
        const cleanPhone = phone.replace(/[\-\s]/g, '');
        const indianPhoneRegex = /^(?:\+91|91)?(?:[6789]\d{9})$/;
        if (!indianPhoneRegex.test(cleanPhone)) {
             return res.status(400).json({ message: "Invalid Indian phone number format" });
        }
        phone = cleanPhone.startsWith('+91') ? cleanPhone : 
                cleanPhone.startsWith('91') && cleanPhone.length === 12 ? '+' + cleanPhone : 
                '+91' + cleanPhone;
    }

    const targetRole = req.body.role || 'customer';
    const Model = getModelByRole(targetRole);

    const updateFields = {
      name: req.body.name,
      email: req.body.email,
      phone: phone || "",
      address: req.body.address,
      bio: req.body.bio,
      specialization: req.body.specialization,
      image: req.body.image,
    };
    
    if (fcmToken) {
        updateFields.fcmToken = fcmToken;
    }

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
    let { firebaseUid, name, email, role, image, phone, fcmToken } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ message: "firebaseUid and email are required" });
    }

    if (phone) {
        const cleanPhone = phone.replace(/[\-\s]/g, '');
        const indianPhoneRegex = /^(?:\+91|91)?(?:[6789]\d{9})$/;
        if (!indianPhoneRegex.test(cleanPhone)) {
             return res.status(400).json({ message: "Invalid Indian phone number format" });
        }
        phone = cleanPhone.startsWith('+91') ? cleanPhone : 
                cleanPhone.startsWith('91') && cleanPhone.length === 12 ? '+' + cleanPhone : 
                '+91' + cleanPhone;
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
        if (fcmToken) {
            user.fcmToken = fcmToken;
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
        phone: phone || "",
        fcmToken: fcmToken || "",
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


/* ---------------- FORGOT PASSWORD ---------------- */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Search across all role collections (case-insensitive email match)
    const emailRegex = new RegExp(`^${email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const models = [Customer, Farmer, Admin];
    let user = null;
    for (const Model of models) {
      user = await Model.findOne({ email: emailRegex });
      if (user) break;
    }

    // Always respond the same way to prevent email enumeration
    if (!user) {
      return res.json({ message: "If that email is registered, a reset link has been sent." });
    }

    // Check if this is a social-only account (no password set)
    if (user.firebaseUid && !user.password) {
      return res.json({ message: "If that email is registered, a reset link has been sent." });
    }

    // Generate a secure 6-digit OTP
    const plainToken = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = crypto.createHash("sha256").update(plainToken).digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = tokenHash;
    user.passwordResetExpires = expires;
    await user.save();

    // Respond to client immediately — token is already saved in DB
    res.json({ message: "If that email is registered, an OTP has been sent." });

    // Send email in background (non-blocking) — won't affect HTTP response
    setImmediate(async () => {
      try {
        const resetHtml = buildHtmlEmail(
          "Reset Your FarmLink Password",
          `
            <h2>Password Reset OTP 🔐</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>We received a request to reset your FarmLink password. Use the OTP below to set a new password. It is valid for <strong>1 hour</strong>.</p>
            <div class="highlight-box" style="font-size:32px;text-align:center;letter-spacing:12px;font-weight:bold;color:#2d6a4f;margin:30px 0;">
              ${plainToken}
            </div>
            <p>If you did not request this, you can safely ignore this email. Your password will not change.</p>
            <p style="color:#888;font-size:12px;">Expires: ${expires.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
          `
        );
        await sendEmail(user.email, "Your FarmLink Password Reset OTP 🔐", resetHtml);
        console.log(`[ForgotPassword] Reset OTP sent to ${user.email}`);
      } catch (emailErr) {
        console.error("[ForgotPassword] Email dispatch failed:", emailErr.message);
      }
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- VERIFY RESET TOKEN ---------------- */
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

    // Search all role collections for the matching token
    const models = [Customer, Farmer, Admin];
    let user = null;
    for (const Model of models) {
      user = await Model.findOne({
        passwordResetToken: tokenHash,
        passwordResetExpires: { $gt: new Date() },
      });
      if (user) break;
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP. Please request a new one." });
    }

    res.json({ message: "OTP is valid." });
  } catch (err) {
    console.error("VERIFY TOKEN ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


/* ---------------- RESET PASSWORD ---------------- */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

    // Search all role collections for the matching token
    const models = [Customer, Farmer, Admin];
    let user = null;
    for (const Model of models) {
      user = await Model.findOne({
        passwordResetToken: tokenHash,
        passwordResetExpires: { $gt: new Date() },
      });
      if (user) break;
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP. Please request a new one." });
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = "";
    user.passwordResetExpires = null;
    await user.save();

    // Notify user via confirmation email (non-blocking)
    const confirmHtml = buildHtmlEmail(
      "Your FarmLink Password Has Been Changed",
      `
        <h2>Password Changed Successfully ✅</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your FarmLink account password has been updated successfully at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.</p>
        <p>If you did not make this change, please contact support immediately.</p>
      `
    );
    setImmediate(() => sendEmail(user.email, "Your FarmLink Password Has Been Changed ✅", confirmHtml));

    res.json({ message: "Password has been reset successfully. You can now log in with your new password." });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};