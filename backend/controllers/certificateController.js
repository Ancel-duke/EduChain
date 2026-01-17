const certificateService = require('../services/certificateService');

/**
 * Certificate Controller
 * Handles HTTP requests and responses for certificate operations
 */
class CertificateController {
  /**
   * POST /api/certificates/mint
   * Mint a new certificate NFT
   */
  async mint(req, res) {
    try {
      const {
        certificateId,
        studentAddress,
        studentName,
        courseName,
        institution,
        issueDate,
      } = req.body;

      // Validate required fields
      if (!certificateId || !studentAddress || !studentName || !courseName || !institution) {
        return res.status(400).json({
          error: 'Missing required fields: certificateId, studentAddress, studentName, courseName, institution',
        });
      }

      // Validate Ethereum address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(studentAddress)) {
        return res.status(400).json({
          error: 'Invalid Ethereum address format',
        });
      }

      const result = await certificateService.mintCertificate({
        certificateId,
        studentAddress,
        studentName,
        courseName,
        institution,
        issueDate,
      });

      res.status(201).json({
        success: true,
        certificate: result.certificate,
        nft: result.nft,
      });
    } catch (error) {
      console.error('Error minting certificate:', error);
      res.status(500).json({
        error: error.message || 'Failed to mint certificate',
      });
    }
  }

  /**
   * GET /api/certificates/verify/:tokenId
   * Verify a certificate by token ID
   */
  async verify(req, res) {
    try {
      const { tokenId } = req.params;

      if (!tokenId || isNaN(tokenId)) {
        return res.status(400).json({
          error: 'Invalid token ID',
        });
      }

      const verification = await certificateService.verifyCertificate(tokenId);

      if (verification.error) {
        return res.status(404).json(verification);
      }

      res.json(verification);
    } catch (error) {
      console.error('Error verifying certificate:', error);
      res.status(500).json({
        error: error.message || 'Failed to verify certificate',
      });
    }
  }

  /**
   * GET /api/certificates/:id
   * Get a specific certificate
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const certificate = await certificateService.getCertificate(id);
      res.json(certificate);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      res.status(404).json({
        error: error.message || 'Certificate not found',
      });
    }
  }

  /**
   * GET /api/certificates
   * Get all certificates with optional filters
   */
  async getAll(req, res) {
    try {
      const certificates = await certificateService.getCertificates({
        studentAddress: req.query.studentAddress,
        status: req.query.status,
        limit: parseInt(req.query.limit) || 100,
      });
      res.json(certificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      res.status(500).json({
        error: 'Failed to fetch certificates',
      });
    }
  }
}

module.exports = new CertificateController();
