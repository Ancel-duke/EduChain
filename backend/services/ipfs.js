const axios = require('axios');
require('dotenv').config();

/**
 * IPFS Service using Pinata
 * Handles uploading certificate metadata to IPFS
 */
class IPFSService {
  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY;
    this.pinataJWT = process.env.PINATA_JWT;
    this.baseURL = 'https://api.pinata.cloud';
  }

  /**
   * Upload JSON metadata to IPFS via Pinata
   * @param {Object} metadata - Certificate metadata object
   * @returns {Promise<string>} IPFS hash (CID)
   */
  async uploadMetadata(metadata) {
    if (!this.pinataJWT && (!this.pinataApiKey || !this.pinataSecretKey)) {
      throw new Error('Pinata credentials not configured. Set PINATA_JWT or PINATA_API_KEY and PINATA_SECRET_KEY');
    }

    try {
      const url = `${this.baseURL}/pinning/pinJSONToIPFS`;
      const headers = this.pinataJWT
        ? { Authorization: `Bearer ${this.pinataJWT}` }
        : {
            pinata_api_key: this.pinataApiKey,
            pinata_secret_api_key: this.pinataSecretKey,
          };

      const response = await axios.post(url, metadata, { headers });

      if (response.data && response.data.IpfsHash) {
        return response.data.IpfsHash;
      }

      throw new Error('Invalid response from Pinata');
    } catch (error) {
      console.error('Error uploading to IPFS:', error.response?.data || error.message);
      throw new Error(`Failed to upload to IPFS: ${error.response?.data?.error?.details || error.message}`);
    }
  }

  /**
   * Upload file to IPFS via Pinata
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - File name
   * @returns {Promise<string>} IPFS hash (CID)
   */
  async uploadFile(fileBuffer, fileName) {
    if (!this.pinataJWT && (!this.pinataApiKey || !this.pinataSecretKey)) {
      throw new Error('Pinata credentials not configured');
    }

    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', fileBuffer, fileName);

      const url = `${this.baseURL}/pinning/pinFileToIPFS`;
      const headers = this.pinataJWT
        ? { 
            Authorization: `Bearer ${this.pinataJWT}`,
            ...formData.getHeaders()
          }
        : {
            pinata_api_key: this.pinataApiKey,
            pinata_secret_api_key: this.pinataSecretKey,
            ...formData.getHeaders()
          };

      const response = await axios.post(url, formData, { headers });

      if (response.data && response.data.IpfsHash) {
        return response.data.IpfsHash;
      }

      throw new Error('Invalid response from Pinata');
    } catch (error) {
      console.error('Error uploading file to IPFS:', error.response?.data || error.message);
      throw new Error(`Failed to upload file to IPFS: ${error.response?.data?.error?.details || error.message}`);
    }
  }

  /**
   * Create certificate metadata JSON
   * @param {Object} certificateData - Certificate data
   * @returns {Object} Metadata object following ERC721 metadata standard
   */
  createCertificateMetadata(certificateData) {
    return {
      name: `${certificateData.courseName} - ${certificateData.institution}`,
      description: `Academic certificate issued to ${certificateData.studentName} for completing ${certificateData.courseName} at ${certificateData.institution}`,
      image: certificateData.imageHash || '', // IPFS hash of certificate image (optional)
      attributes: [
        {
          trait_type: 'Student Name',
          value: certificateData.studentName,
        },
        {
          trait_type: 'Course',
          value: certificateData.courseName,
        },
        {
          trait_type: 'Institution',
          value: certificateData.institution,
        },
        {
          trait_type: 'Issue Date',
          value: certificateData.issueDate || new Date().toISOString(),
        },
        {
          trait_type: 'Certificate ID',
          value: certificateData.certificateId,
        },
      ],
      external_url: certificateData.externalUrl || '',
    };
  }
}

module.exports = new IPFSService();
