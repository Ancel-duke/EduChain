const Certificate = require('../models/Certificate');
const Student = require('../models/Student');
const blockchainService = require('./blockchain');
const ipfsService = require('./ipfs');

/**
 * Certificate Service
 * Handles business logic for certificate operations
 */
class CertificateService {
  /**
   * Mint a new certificate NFT
   * @param {Object} certificateData - Certificate data
   * @returns {Promise<Object>} Created certificate with NFT details
   */
  async mintCertificate(certificateData) {
    const {
      certificateId,
      studentAddress,
      studentName,
      courseName,
      institution,
      issueDate,
    } = certificateData;

    // Validate required fields
    if (!certificateId || !studentAddress || !studentName || !courseName || !institution) {
      throw new Error('Missing required certificate fields');
    }

    // Check if certificate already exists (duplicate certificateId)
    const existing = await Certificate.findOne({ certificateId });
    if (existing) {
      throw new Error(`Certificate ID "${certificateId}" already exists. Please use a unique certificate ID.`);
    }

    // Create or update student
    let student = await Student.findOne({ address: studentAddress.toLowerCase() });
    if (!student) {
      student = new Student({
        address: studentAddress.toLowerCase(),
        name: studentName,
      });
      await student.save();
    }

    // Create certificate metadata for IPFS
    const metadata = ipfsService.createCertificateMetadata({
      certificateId,
      studentName,
      courseName,
      institution,
      issueDate: issueDate || new Date().toISOString(),
    });

    console.log('[SERVICE] Uploading metadata to IPFS...');
    // Upload metadata to IPFS
    let ipfsHash;
    try {
      ipfsHash = await ipfsService.uploadMetadata(metadata);
      
      // Validate IPFS upload success
      if (!ipfsHash || typeof ipfsHash !== 'string' || ipfsHash.length === 0) {
        throw new Error('IPFS upload returned invalid hash');
      }
      
      // Validate IPFS hash format (basic check - should be alphanumeric)
      if (!/^[a-zA-Z0-9]+$/.test(ipfsHash)) {
        throw new Error('IPFS hash format is invalid');
      }
      
      console.log('[SERVICE] IPFS upload successful:', { ipfsHash });
    } catch (error) {
      console.error('[SERVICE] IPFS upload failed:', error.message);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }

    // Check for duplicate token ID in database (before minting)
    // Note: This is a safety check, but tokenId is assigned by blockchain
    // The database unique constraint will also prevent duplicates
    
    // Mint NFT on blockchain (only after IPFS upload is validated)
    console.log('[SERVICE] Minting NFT on blockchain...');
    let tokenId;
    let transactionHash;
    try {
      const result = await blockchainService.mintCertificate(studentAddress, ipfsHash);
      tokenId = result.tokenId;
      transactionHash = result.txHash;
      
      // Validate minting result
      if (!tokenId || tokenId <= 0 || !Number.isInteger(tokenId)) {
        throw new Error('Blockchain minting returned invalid token ID');
      }
      if (!transactionHash || transactionHash.length === 0) {
        throw new Error('Blockchain minting returned invalid transaction hash');
      }
      
      // Check for duplicate token ID in database (after minting)
      // This is a safety check - the database unique constraint will also prevent duplicates
      const existingCert = await Certificate.findOne({ tokenId });
      if (existingCert) {
        console.error('[SERVICE] Duplicate token ID detected:', { tokenId, existingCert: existingCert.certificateId });
        throw new Error(`Token ID ${tokenId} already exists in database. This indicates a blockchain state issue.`);
      }
      
      console.log('[SERVICE] Blockchain minting successful:', { tokenId, transactionHash });
    } catch (error) {
      console.error('[SERVICE] Blockchain minting failed:', error.message);
      // If blockchain minting fails, still save certificate with failed status
      const certificate = new Certificate({
        certificateId,
        studentAddress: studentAddress.toLowerCase(),
        studentName,
        courseName,
        institution,
        tokenURI: `ipfs://${ipfsHash}`,
        ipfsHash,
        status: 'failed',
      });
      await certificate.save();
      throw new Error(`Blockchain minting failed: ${error.message}`);
    }

    // Save certificate to database
    const certificate = new Certificate({
      certificateId,
      studentAddress: studentAddress.toLowerCase(),
      studentName,
      courseName,
      institution,
      tokenURI: `ipfs://${ipfsHash}`,
      ipfsHash,
      tokenId,
      transactionHash,
      issueDate: issueDate || new Date(),
      status: 'minted',
    });

    await certificate.save();

    // Add certificate to student's list
    student.certificates.push(certificate._id);
    await student.save();

    console.log('[SERVICE] Certificate saved successfully:', {
      certificateId,
      tokenId,
    });

    return {
      certificate,
      nft: {
        tokenId,
        transactionHash,
        ipfsHash,
      },
    };
  }

  /**
   * Verify a certificate by token ID
   * @param {number} tokenId - NFT token ID
   * @returns {Promise<Object>} Verification result with certificate details
   */
  async verifyCertificate(tokenId) {
    console.log('[SERVICE] Verifying certificate:', { tokenId });
    
    // Validate token ID format
    const parsedTokenId = parseInt(tokenId);
    if (isNaN(parsedTokenId) || parsedTokenId <= 0 || !Number.isInteger(parsedTokenId)) {
      console.log('[SERVICE] Invalid token ID format:', { tokenId });
      return {
        isValid: false,
        error: 'Invalid token ID format. Token ID must be a positive integer.',
      };
    }

    // Check if token ID exceeds reasonable bounds (prevent overflow)
    if (parsedTokenId > Number.MAX_SAFE_INTEGER) {
      console.log('[SERVICE] Token ID exceeds maximum safe integer:', { tokenId });
      return {
        isValid: false,
        error: 'Token ID is too large.',
      };
    }
    
    // Get certificate from database
    const certificate = await Certificate.findOne({ tokenId: parsedTokenId });
    
    if (!certificate) {
      console.log('[SERVICE] Certificate not found in database:', { tokenId: parsedTokenId });
      return {
        isValid: false,
        error: `Certificate with token ID ${parsedTokenId} not found in database`,
      };
    }

    // Verify on blockchain
    let blockchainVerification;
    try {
      console.log('[SERVICE] Verifying on blockchain...');
      blockchainVerification = await blockchainService.verifyCertificate(tokenId);
      console.log('[SERVICE] Blockchain verification result:', {
        isValid: blockchainVerification.isValid,
      });
    } catch (error) {
      console.error('[SERVICE] Blockchain verification error:', error.message);
      return {
        isValid: false,
        error: `Blockchain verification failed: ${error.message}`,
        certificate: {
          certificateId: certificate.certificateId,
          studentName: certificate.studentName,
          courseName: certificate.courseName,
          institution: certificate.institution,
          issueDate: certificate.issueDate,
        },
      };
    }

    // Compare database and blockchain data
    const isValid = 
      blockchainVerification.isValid &&
      certificate.studentAddress.toLowerCase() === blockchainVerification.student.toLowerCase() &&
      certificate.status === 'minted';

    return {
      isValid,
      certificate: {
        certificateId: certificate.certificateId,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        institution: certificate.institution,
        issueDate: certificate.issueDate,
        tokenId: certificate.tokenId,
        transactionHash: certificate.transactionHash,
        ipfsHash: blockchainVerification.ipfsHash,
      },
      blockchain: {
        student: blockchainVerification.student,
        issueDate: blockchainVerification.issueDate,
        ipfsHash: blockchainVerification.ipfsHash,
      },
    };
  }

  /**
   * Get certificate by ID
   * @param {string} id - Certificate ID (MongoDB _id, certificateId, or tokenId)
   * @returns {Promise<Object>} Certificate document
   */
  async getCertificate(id) {
    const certificate = await Certificate.findOne({
      $or: [
        { _id: id },
        { certificateId: id },
        { tokenId: parseInt(id) },
      ],
    });

    if (!certificate) {
      throw new Error('Certificate not found');
    }

    return certificate;
  }

  /**
   * Get all certificates with optional filters
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} Array of certificates
   */
  async getCertificates(filters = {}) {
    const query = {};

    if (filters.studentAddress) {
      query.studentAddress = filters.studentAddress.toLowerCase();
    }
    if (filters.status) {
      query.status = filters.status;
    }

    return Certificate.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 100);
  }
}

module.exports = new CertificateService();
