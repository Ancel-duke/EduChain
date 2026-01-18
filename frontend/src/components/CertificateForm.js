import React, { useState } from 'react';
import { createCertificate } from '../utils/api';

function CertificateForm({ contract, account }) {
  const [formData, setFormData] = useState({
    certificateId: '',
    studentAddress: '',
    studentName: '',
    courseName: '',
    institution: '',
    tokenURI: '',
    mintNFT: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await createCertificate(formData);
      setSuccess(true);
      setFormData({
        certificateId: '',
        studentAddress: '',
        studentName: '',
        courseName: '',
        institution: '',
        tokenURI: '',
        mintNFT: false,
      });

      // Show success message for 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Issue Certificate</h2>

      {error && (
        <div className="mb-6 p-4 bg-gray-50 border border-red-300 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-gray-900 text-white rounded-md">
          <p className="text-sm">Certificate created successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700 mb-2">
            Certificate ID *
          </label>
          <input
            type="text"
            id="certificateId"
            name="certificateId"
            value={formData.certificateId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-800"
            placeholder="CERT-2024-001"
          />
        </div>

        <div>
          <label htmlFor="studentAddress" className="block text-sm font-medium text-gray-700 mb-2">
            Student Wallet Address *
          </label>
          <input
            type="text"
            id="studentAddress"
            name="studentAddress"
            value={formData.studentAddress}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-800 font-mono text-sm"
            placeholder="0x..."
          />
        </div>

        <div>
          <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
            Student Name *
          </label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-800"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2">
            Course Name *
          </label>
          <input
            type="text"
            id="courseName"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-800"
            placeholder="Blockchain Fundamentals"
          />
        </div>

        <div>
          <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-2">
            Institution *
          </label>
          <input
            type="text"
            id="institution"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-800"
            placeholder="University Name"
          />
        </div>

        <div>
          <label htmlFor="tokenURI" className="block text-sm font-medium text-gray-700 mb-2">
            Token URI *
          </label>
          <input
            type="text"
            id="tokenURI"
            name="tokenURI"
            value={formData.tokenURI}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-800"
            placeholder="https://example.com/metadata/1"
          />
          <p className="mt-1 text-xs text-gray-500">
            URI pointing to certificate metadata (IPFS, Arweave, or HTTP)
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="mintNFT"
            name="mintNFT"
            checked={formData.mintNFT}
            onChange={handleChange}
            className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-200 rounded"
          />
          <label htmlFor="mintNFT" className="ml-2 block text-sm text-gray-700">
            Mint NFT immediately
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                certificateId: '',
                studentAddress: '',
                studentName: '',
                courseName: '',
                institution: '',
                tokenURI: '',
                mintNFT: false,
              });
              setError(null);
              setSuccess(false);
            }}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={loading || !account}
            className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Creating...
              </span>
            ) : (
              'Create Certificate'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CertificateForm;
