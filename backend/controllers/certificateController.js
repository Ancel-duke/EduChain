const certificateService = require('../services/certificateService');

/**
 * Certificate Controller
 * Handles HTTP requests and responses for certificate operations
 */
class CertificateController {
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
   * POST /api/certificates/mint
   * Mint a new certificate NFT
   */
  async mint(req, res) {
    try {
      console.log('[MINT] Request received:', {
        certificateId: req.body.certificateId,
        studentAddress: req.body.studentAddress,
      });

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
        return this.sendResponse(
          res,
          400,
          false,
          'Missing required fields: certificateId, studentAddress, studentName, courseName, institution'
        );
      }

      // Validate Ethereum address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(studentAddress)) {
        return this.sendResponse(
          res,
          400,
          false,
          'Invalid Ethereum address format'
        );
      }

      const result = await certificateService.mintCertificate({
        certificateId,
        studentAddress,
        studentName,
        courseName,
        institution,
        issueDate,
      });

      console.log('[MINT] Success:', {
        certificateId: result.certificate.certificateId,
        tokenId: result.nft.tokenId,
      });

      return this.sendResponse(
        res,
        201,
        true,
        'Certificate minted successfully',
        {
          certificate: result.certificate,
          nft: result.nft,
        }
      );
    } catch (error) {
      console.error('[MINT] Error:', error.message);
      return this.sendResponse(
        res,
        500,
        false,
        error.message || 'Failed to mint certificate'
      );
    }
  }

  /**
   * GET /api/certificates/verify/:tokenId
   * Verify a certificate by token ID
   */
  async verify(req, res) {
    try {
      const { tokenId } = req.params;
      console.log('[VERIFY] Request received:', { tokenId });

      // Enhanced token ID validation
      if (!tokenId) {
        return this.sendResponse(
          res,
          400,
          false,
          'Token ID is required'
        );
      }

      const parsedTokenId = parseInt(tokenId);
      if (isNaN(parsedTokenId) || parsedTokenId <= 0 || !Number.isInteger(parsedTokenId)) {
        return this.sendResponse(
          res,
          400,
          false,
          'Invalid token ID format. Token ID must be a positive integer.'
        );
      }

      // Check for token ID overflow
      if (parsedTokenId > Number.MAX_SAFE_INTEGER) {
        return this.sendResponse(
          res,
          400,
          false,
          'Token ID is too large'
        );
      }

      const verification = await certificateService.verifyCertificate(tokenId);

      if (!verification.isValid) {
        console.log('[VERIFY] Certificate invalid:', { tokenId });
        return this.sendResponse(
          res,
          404,
          false,
          verification.error || 'Certificate verification failed',
          verification
        );
      }

      console.log('[VERIFY] Success:', { tokenId, isValid: verification.isValid });
      return this.sendResponse(
        res,
        200,
        true,
        'Certificate verified successfully',
        verification
      );
    } catch (error) {
      console.error('[VERIFY] Error:', error.message);
      return this.sendResponse(
        res,
        500,
        false,
        error.message || 'Failed to verify certificate'
      );
    }
  }

  /**
   * GET /api/certificates/:id
   * Get a specific certificate
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      console.log('[GET_BY_ID] Request received:', { id });

      const certificate = await certificateService.getCertificate(id);

      console.log('[GET_BY_ID] Success:', { id, certificateId: certificate.certificateId });
      return this.sendResponse(
        res,
        200,
        true,
        'Certificate retrieved successfully',
        certificate
      );
    } catch (error) {
      console.error('[GET_BY_ID] Error:', error.message);
      return this.sendResponse(
        res,
        404,
        false,
        error.message || 'Certificate not found'
      );
    }
  }

  /**
   * GET /api/certificates
   * Get all certificates with optional filters
   */
  async getAll(req, res) {
    try {
      const filters = {
        studentAddress: req.query.studentAddress,
        status: req.query.status,
        limit: parseInt(req.query.limit) || 100,
      };
      console.log('[GET_ALL] Request received:', filters);

      const certificates = await certificateService.getCertificates(filters);

      console.log('[GET_ALL] Success:', { count: certificates.length });
      return this.sendResponse(
        res,
        200,
        true,
        'Certificates retrieved successfully',
        { certificates, count: certificates.length }
      );
    } catch (error) {
      console.error('[GET_ALL] Error:', error.message);
      return this.sendResponse(
        res,
        500,
        false,
        error.message || 'Failed to fetch certificates'
      );
    }
  }
}

module.exports = new CertificateController();
