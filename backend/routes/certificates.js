const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

/**
 * POST /api/certificates/mint
 * Mint a new certificate NFT
 * 
 * Body:
 * {
 *   "certificateId": "CERT-2024-001",
 *   "studentAddress": "0x...",
 *   "studentName": "John Doe",
 *   "courseName": "Blockchain Fundamentals",
 *   "institution": "University Name",
 *   "issueDate": "2024-01-17T00:00:00.000Z" (optional)
 * }
 */
router.post('/mint', certificateController.mint.bind(certificateController));

/**
 * GET /api/certificates/verify/:tokenId
 * Verify a certificate by token ID
 * 
 * Returns:
 * {
 *   "isValid": true/false,
 *   "certificate": {...},
 *   "blockchain": {...}
 * }
 */
router.get('/verify/:tokenId', certificateController.verify.bind(certificateController));

/**
 * GET /api/certificates/:id
 * Get a specific certificate by ID (MongoDB _id, certificateId, or tokenId)
 */
router.get('/:id', certificateController.getById.bind(certificateController));

/**
 * GET /api/certificates
 * Get all certificates with optional filters
 * Query params: studentAddress, status, limit
 */
router.get('/', certificateController.getAll.bind(certificateController));

module.exports = router;
