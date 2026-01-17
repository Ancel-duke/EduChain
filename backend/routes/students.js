const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Certificate = require("../models/Certificate");

/**
 * GET /api/students
 * Get all students
 */
router.get("/", async (req, res) => {
  try {
    const students = await Student.find()
      .populate("certificates")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

/**
 * GET /api/students/:address
 * Get a specific student by wallet address
 */
router.get("/:address", async (req, res) => {
  try {
    const student = await Student.findOne({
      address: req.params.address.toLowerCase(),
    }).populate("certificates");

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ error: "Failed to fetch student" });
  }
});

/**
 * POST /api/students
 * Create or update a student
 */
router.post("/", async (req, res) => {
  try {
    const { address, name, email } = req.body;

    if (!address || !name) {
      return res.status(400).json({ error: "Address and name are required" });
    }

    let student = await Student.findOne({ address: address.toLowerCase() });

    if (student) {
      // Update existing student
      student.name = name;
      if (email) student.email = email.toLowerCase();
      await student.save();
      return res.json(student);
    }

    // Create new student
    student = new Student({
      address: address.toLowerCase(),
      name,
      email: email ? email.toLowerCase() : undefined,
    });

    await student.save();
    res.status(201).json(student);
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ error: "Failed to create student" });
  }
});

module.exports = router;
