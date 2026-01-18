const Student = require('../models/Student');

/**
 * Student Controller
 * Handles HTTP requests and responses for student operations
 */
class StudentController {
  /**
   * Helper method to send structured JSON response
   */
  sendResponse(res, statusCode, success, message, data = null) {
    const response = { success, message };
    if (data !== null) {
      response.data = data;
    }
    return res.status(statusCode).json(response);
  }

  /**
   * GET /api/students
   * Get all students
   */
  async getAll(req, res) {
    try {
      console.log('[STUDENTS] GET_ALL request received');
      
      const students = await Student.find()
        .populate('certificates')
        .sort({ createdAt: -1 })
        .limit(100);

      console.log('[STUDENTS] GET_ALL success:', { count: students.length });
      return this.sendResponse(
        res,
        200,
        true,
        'Students retrieved successfully',
        { students, count: students.length }
      );
    } catch (error) {
      console.error('[STUDENTS] GET_ALL error:', error.message);
      return this.sendResponse(
        res,
        500,
        false,
        error.message || 'Failed to fetch students'
      );
    }
  }

  /**
   * GET /api/students/:address
   * Get a specific student by wallet address
   */
  async getByAddress(req, res) {
    try {
      const { address } = req.params;
      console.log('[STUDENTS] GET_BY_ADDRESS request received:', { address });

      const student = await Student.findOne({
        address: address.toLowerCase(),
      }).populate('certificates');

      if (!student) {
        console.log('[STUDENTS] GET_BY_ADDRESS not found:', { address });
        return this.sendResponse(
          res,
          404,
          false,
          'Student not found'
        );
      }

      console.log('[STUDENTS] GET_BY_ADDRESS success:', { address });
      return this.sendResponse(
        res,
        200,
        true,
        'Student retrieved successfully',
        student
      );
    } catch (error) {
      console.error('[STUDENTS] GET_BY_ADDRESS error:', error.message);
      return this.sendResponse(
        res,
        500,
        false,
        error.message || 'Failed to fetch student'
      );
    }
  }

  /**
   * POST /api/students
   * Create or update a student
   */
  async createOrUpdate(req, res) {
    try {
      const { address, name, email } = req.body;
      console.log('[STUDENTS] CREATE_OR_UPDATE request received:', { address, name });

      if (!address || !name) {
        return this.sendResponse(
          res,
          400,
          false,
          'Address and name are required'
        );
      }

      let student = await Student.findOne({ address: address.toLowerCase() });

      if (student) {
        // Update existing student
        student.name = name;
        if (email) student.email = email.toLowerCase();
        await student.save();
        
        console.log('[STUDENTS] CREATE_OR_UPDATE updated:', { address });
        return this.sendResponse(
          res,
          200,
          true,
          'Student updated successfully',
          student
        );
      }

      // Create new student
      student = new Student({
        address: address.toLowerCase(),
        name,
        email: email ? email.toLowerCase() : undefined,
      });

      await student.save();
      
      console.log('[STUDENTS] CREATE_OR_UPDATE created:', { address });
      return this.sendResponse(
        res,
        201,
        true,
        'Student created successfully',
        student
      );
    } catch (error) {
      console.error('[STUDENTS] CREATE_OR_UPDATE error:', error.message);
      return this.sendResponse(
        res,
        500,
        false,
        error.message || 'Failed to create student'
      );
    }
  }
}

module.exports = new StudentController();
