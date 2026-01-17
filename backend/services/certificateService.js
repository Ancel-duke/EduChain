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

    // Check if certificate already exists
    const existing = await Certificate.findOne({ certificateId });
    if (existing) {
      throw new Error('Certificate ID already exists');
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

    // Upload metadata to IPFS
    let ipfsHash;
    try {
      ipfsHash = await ipfsService.uploadMetadata(metadata);
    } catch (error) {
      throw new Error(`IPFS upload failed: ${error.message}`);
    }

    // Mint NFT on blockchain
    let tokenId;
    let transactionHash;
    try {
      const result = await blockchainService.mintCertificate(studentAddress, ipfsHash);
      tokenId = result.tokenId;
      transactionHash = result.txHash;
    } catch (error) {
      // If blockchain minting fails, still save certificate with pending status
      const certificate = new Certificate({
        certificateId,
        studentAddress: studentAddress.toLowerCase(),
        studentName,
        courseName,
        institution,
        tokenURI: `ipfs://${ipfsHash}`,
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
    // Get certificate from database
    const certificate = await Certificate.findOne({ tokenId: parseInt(tokenId) });
    
    if (!certificate) {
      return {
        isValid: false,
        error: 'Certificate not found in database',
      };
    }

    // Verify on blockchain
    let blockchainVerification;
    try {
      blockchainVerification = await blockchainService.verifyCertificate(tokenId);
    } catch (error) {
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
