import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContract } from '../hooks/useContract';
import { verifyCertificate as verifyContract } from '../utils/contractHelpers';

function Verification() {
  const navigate = useNavigate();
  const contract = useContract();
  const [tokenId, setTokenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [verificationMethod, setVerificationMethod] = useState('api'); // 'api' or 'contract'

  const handleVerify = async (e) => {
    e.preventDefault();
    
    // Enhanced token ID validation
    if (!tokenId || tokenId.trim() === '') {
      setError('Please enter a token ID');
      return;
    }

    const parsedTokenId = parseInt(tokenId);
    if (isNaN(parsedTokenId) || parsedTokenId <= 0 || !Number.isInteger(parsedTokenId)) {
      setError('Invalid token ID. Token ID must be a positive integer (e.g., 1, 2, 3)');
      return;
    }

    // Check for token ID overflow
    if (parsedTokenId > Number.MAX_SAFE_INTEGER) {
      setError('Token ID is too large');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (verificationMethod === 'contract' && contract) {
        // Verify directly on blockchain using contract
        const verification = await verifyContract(contract, parsedTokenId);
        setResult({
          isValid: verification.isValid,
          certificate: {
            tokenId: parsedTokenId,
            student: verification.student,
            issueDate: verification.issueDate,
            ipfsHash: verification.ipfsHash,
          },
          blockchain: verification,
        });
      } else {
        // Verify via backend API
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/certificates/verify/${parsedTokenId}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || data.error || 'Verification failed');
        }

        setResult(data.data || data);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'An error occurred while verifying the certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-8 inline-block"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-light text-gray-900 mb-3">Verify Certificate</h1>
          <p className="text-gray-600 font-light">Enter a token ID to verify certificate authenticity</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700 mb-2">
                Token ID
              </label>
              <input
                type="text"
                id="tokenId"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-800"
                placeholder="1"
              />
            </div>

            {contract && (
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="verify-api"
                  name="verify-method"
                  value="api"
                  checked={verificationMethod === 'api'}
                  onChange={(e) => setVerificationMethod(e.target.value)}
                  className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300"
                />
                <label htmlFor="verify-api" className="text-sm text-gray-700">
                  Verify via API (includes database check)
                </label>
              </div>
            )}

            {contract && (
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="verify-contract"
                  name="verify-method"
                  value="contract"
                  checked={verificationMethod === 'contract'}
                  onChange={(e) => setVerificationMethod(e.target.value)}
                  className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300"
                />
                <label htmlFor="verify-contract" className="text-sm text-gray-700">
                  Verify directly on blockchain
                </label>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Verifying...
              </span>
            ) : (
              'Verify'
            )}
          </button>
        </form>

        {!result && !loading && !error && (
          <div className="mt-12 text-center py-12 px-4">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No verification yet</h3>
              <p className="text-sm text-gray-600">
                Enter a token ID above to verify a certificate's authenticity on the blockchain.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 p-6 bg-gray-50 border border-red-300 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <div className={`p-6 rounded-md border-2 ${
              result.isValid 
                ? 'bg-gray-50 border-gray-900' 
                : 'bg-gray-50 border-gray-300'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Verification Result</h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  result.isValid
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}>
                  {result.isValid ? 'Valid' : 'Invalid'}
                </span>
              </div>

              {result.certificate && (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 mb-1">Certificate ID</p>
                      <p className="text-gray-900 font-mono">{result.certificate.certificateId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Token ID</p>
                      <p className="text-gray-900">{result.certificate.tokenId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Student Name</p>
                      <p className="text-gray-900">{result.certificate.studentName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Course</p>
                      <p className="text-gray-900">{result.certificate.courseName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Institution</p>
                      <p className="text-gray-900">{result.certificate.institution}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Issue Date</p>
                      <p className="text-gray-900">
                        {new Date(result.certificate.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {result.certificate.transactionHash && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-gray-500 mb-1">Transaction Hash</p>
                      <p className="text-gray-900 font-mono text-xs break-all">
                        {result.certificate.transactionHash}
                      </p>
                    </div>
                  )}

                  {result.certificate.ipfsHash && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-gray-500 mb-1">IPFS Hash</p>
                      <p className="text-gray-900 font-mono text-xs break-all">
                        {result.certificate.ipfsHash}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {result.blockchain && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-3">Blockchain Data</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Student Address:</span>
                      <span className="text-gray-900 font-mono">
                        {result.blockchain.student.slice(0, 6)}...{result.blockchain.student.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Issue Date:</span>
                      <span className="text-gray-900">
                        {new Date(result.blockchain.issueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Verification;
