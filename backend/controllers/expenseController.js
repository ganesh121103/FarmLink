const Expense = require("../models/Expense");

// Add an expense
const addExpense = async (req, res) => {
  try {
    const { farmer, cropName, amount, description, date } = req.body;
    
    if (!farmer || !cropName || !amount) {
      return res.status(400).json({ message: "Farmer, crop name, and amount are required" });
    }

    const expense = new Expense({
      farmer,
      cropName,
      amount,
      description,
      date: date || Date.now()
    });

    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error("Add expense error:", error);
    res.status(500).json({ message: "Failed to add expense", error: error.message });
  }
};

// Get expenses for a farmer
const getFarmerExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ farmer: req.params.farmerId }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ message: "Failed to fetch expenses", error: error.message });
  }
};

// Delete an expense
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    
    await expense.deleteOne();
    res.status(200).json({ message: "Expense deleted successfully", id: req.params.id });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ message: "Failed to delete expense", error: error.message });
  }
};

module.exports = {
  addExpense,
  getFarmerExpenses,
  deleteExpense
};
