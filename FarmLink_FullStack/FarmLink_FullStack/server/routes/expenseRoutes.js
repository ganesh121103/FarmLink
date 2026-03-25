const express = require("express");
const router = express.Router();
const { addExpense, getFarmerExpenses, deleteExpense } = require("../controllers/expenseController");

router.post("/", addExpense);
router.get("/farmer/:farmerId", getFarmerExpenses);
router.delete("/:id", deleteExpense);

module.exports = router;
