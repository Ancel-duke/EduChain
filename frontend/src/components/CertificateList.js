import React, { useState, useEffect } from 'react';
import { fetchCertificates } from '../utils/api';

function CertificateList({ account, contract }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (account) {
      loadCertificates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchCertificates(account);
      // Handle new structured response format
      const data = response.data?.certificates || response.certificates || response;
      setCertificates(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load certificates');
      console.error('Error loading certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">Loading certificates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-red-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCertificates}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No certificates found</h3>
          <p className="text-sm text-gray-600">
            You don't have any certificates yet. Certificates will appear here once they are minted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-light text-gray-900">My Certificates</h2>
        <button
          onClick={loadCertificates}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert) => (
          <CertificateCard key={cert._id || cert.certificateId} certificate={cert} />
        ))}
      </div>
    </div>
  );
}

function CertificateCard({ certificate }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-700',
      minted: 'bg-gray-900 text-white',
      failed: 'bg-gray-200 text-gray-800',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          styles[status] || styles.pending
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 bg-white transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {certificate.courseName}
        </h3>
        {getStatusBadge(certificate.status)}
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium">Institution:</span> {certificate.institution}
        </p>
        <p>
          <span className="font-medium">Student:</span> {certificate.studentName}
        </p>
        <p>
          <span className="font-medium">Issued:</span> {formatDate(certificate.issueDate)}
        </p>
        {certificate.tokenId && (
          <p>
            <span className="font-medium">Token ID:</span> {certificate.tokenId}
          </p>
        )}
        {certificate.transactionHash && (
          <p className="text-xs font-mono text-gray-500 truncate">
            {certificate.transactionHash}
          </p>
        )}
      </div>

      {certificate.certificateId && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 font-mono">
            ID: {certificate.certificateId}
          </p>
        </div>
      )}
    </div>
  );
}

export default CertificateList;
