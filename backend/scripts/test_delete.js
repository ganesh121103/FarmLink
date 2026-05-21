require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign(
    { id: "6a0ae5a83686ceefa4183f54", role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
);

console.log("Generated Token:", token);

// Use fetch to make a delete request to http://localhost:5000/api/products/6a0e1121634e750dc6094484
const run = async () => {
    try {
        const response = await fetch("http://localhost:5000/api/products/6a0e1121634e750dc6094484", {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Data:", data);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
};

run();
