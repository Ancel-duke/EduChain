const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

/**
 * GET /api/students
 * Get all students
 */
router.get("/", studentController.getAll.bind(studentController));

/**
 * GET /api/students/:address
 * Get a specific student by wallet address
 */
router.get("/:address", studentController.getByAddress.bind(studentController));

/**
 * POST /api/students
 * Create or update a student
 */
router.post("/", studentController.createOrUpdate.bind(studentController));

module.exports = router;
