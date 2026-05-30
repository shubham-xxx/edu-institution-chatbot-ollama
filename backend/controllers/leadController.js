const Lead = require("../models/Lead");

const createLead = async (req, res) => {
  try {
    const { name, phone, email, course, city, message } = req.body;

    if (!name && !phone && !email && !course && !message) {
      return res.status(400).json({
        success: false,
        error: "At least one lead field is required.",
      });
    }

    const lead = await Lead.create({
      name,
      phone,
      email,
      course,
      city,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Lead saved successfully.",
      lead,
    });
  } catch (error) {
    console.error("Create lead error:", error.message);

    res.status(500).json({
      success: false,
      error: "Failed to save lead.",
    });
  }
};

const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error("Get leads error:", error.message);

    res.status(500).json({
      success: false,
      error: "Failed to fetch leads.",
    });
  }
};

module.exports = {
  createLead,
  getLeads,
};