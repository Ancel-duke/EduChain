import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useContract } from '../hooks/useContract';
import { getContractOwner } from '../utils/contractHelpers';
import { CustomConnectButton } from '../components/ConnectButton';

function InstitutionDashboard() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const contract = useContract();
  const [isOwner, setIsOwner] = useState(false);
  const [checking, setChecking] = useState(true);
  const [checkingError, setCheckingError] = useState(null);
  const [actualOwner, setActualOwner] = useState(null);
  const [formData, setFormData] = useState({
    certificateId: '',
    studentAddress: '',
    studentName: '',
    courseName: '',
    institution: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkOwner = async () => {
      console.log('[OWNER CHECK] Starting check...', {
        isConnected,
        address,
        hasContract: !!contract,
        contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      });

      if (!isConnected || !address) {
        console.log('[OWNER CHECK] Not connected or no address');
        setChecking(false);
        setIsOwner(false);
        setCheckingError(null);
        return;
      }

      if (!contract) {
        console.error('[OWNER CHECK] Contract is null!');
        setChecking(false);
        setIsOwner(false);
        setCheckingError('Contract not initialized. Check REACT_APP_CONTRACT_ADDRESS in .env');
        return;
      }

      try {
        setCheckingError(null);
        console.log('[OWNER CHECK] Calling getContractOwner...');
        
        const owner = await getContractOwner(contract);
        console.log('[OWNER CHECK] Contract owner result:', owner);
        setActualOwner(owner);
        console.log('[OWNER CHECK] Your address:', address);
        
        const ownerLower = owner.toLowerCase();
        const addressLower = address.toLowerCase();
        const isMatch = ownerLower === addressLower;
        
        console.log('[OWNER CHECK] Owner (lowercase):', ownerLower);
        console.log('[OWNER CHECK] Address (lowercase):', addressLower);
        console.log('[OWNER CHECK] Match?', isMatch);
        
        setIsOwner(isMatch);
        
        if (!isMatch) {
          console.warn('[OWNER CHECK] Addresses do not match!');
          setCheckingError(`Address mismatch. Owner: ${owner}, Your address: ${address}`);
        }
      } catch (error) {
        console.error('[OWNER CHECK] Error:', error);
        console.error('[OWNER CHECK] Error details:', {
          message: error.message,
          code: error.code,
          reason: error.reason,
        });
        setIsOwner(false);
        setCheckingError(`Failed to verify contract ownership: ${error.message}`);
      } finally {
        setChecking(false);
      }
    };

    checkOwner();
  }, [isConnected, address, contract]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure wallet is connected before minting
    if (!isConnected || !address) {
      setError('Please connect your wallet before minting a certificate');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Call backend API which handles IPFS upload and minting
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/certificates/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to mint certificate');
      }

      setSuccess(true);
      setFormData({
        certificateId: '',
        studentAddress: '',
        studentName: '',
        courseName: '',
        institution: '',
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Minting error:', err);
      setError(err.message || 'An error occurred while minting the certificate');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h2 className="text-2xl font-light text-gray-900">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to access the dashboard</p>
          <div className="flex justify-center">
            <CustomConnectButton />
          </div>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Checking permissions...</p>
          {checkingError && (
            <p className="text-sm text-red-600">{checkingError}</p>
          )}
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h2 className="text-2xl font-light text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only the contract owner can mint certificates</p>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-left space-y-2">
            <p className="text-sm font-medium text-gray-900">Contract Address:</p>
            <p className="text-xs font-mono text-gray-600 break-all">{process.env.REACT_APP_CONTRACT_ADDRESS || 'Not set'}</p>
            <p className="text-sm font-medium text-gray-900 mt-4">Contract Owner (from contract):</p>
            <p className="text-xs font-mono text-gray-600 break-all">{actualOwner || 'Not fetched yet'}</p>
            <p className="text-sm font-medium text-gray-900 mt-4">Your Address:</p>
            <p className="text-xs font-mono text-gray-600 break-all">{address || 'Not connected'}</p>
            <p className="text-sm font-medium text-gray-900 mt-4">Contract Instance:</p>
            <p className="text-xs font-mono text-gray-600 break-all">{contract ? '✅ Initialized' : '❌ Not initialized'}</p>
            {checkingError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-600 font-medium">Error Details:</p>
                <p className="text-xs text-red-600 break-all">{checkingError}</p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              To mint certificates, you need to use the contract owner account.
            </p>
            <p className="text-xs text-gray-500">
              In MetaMask, click your account icon and switch to "Imported Account 1" (the contract owner).
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:border-gray-400 text-sm"
            >
              Return Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-light text-gray-900 mb-3">Mint Certificate</h1>
          <p className="text-gray-600 font-light">Issue a new academic certificate as an NFT</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-gray-50 border border-red-300 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-gray-900 text-white rounded-md">
            <p className="text-sm">Certificate minted successfully</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700 mb-2">
                Certificate ID
              </label>
              <input
                type="text"
                id="certificateId"
                name="certificateId"
                value={formData.certificateId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-800"
                placeholder="CERT-2024-001"
              />
            </div>

            <div>
              <label htmlFor="studentAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Student Wallet Address
              </label>
              <input
                type="text"
                id="studentAddress"
                name="studentAddress"
                value={formData.studentAddress}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-800 font-mono text-sm"
                placeholder="0x..."
              />
            </div>

            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                Student Name
              </label>
              <input
                type="text"
                id="studentName"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-800"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2">
                Course Name
              </label>
              <input
                type="text"
                id="courseName"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-800"
                placeholder="Blockchain Fundamentals"
              />
            </div>

            <div>
              <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-2">
                Institution
              </label>
              <input
                type="text"
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-800"
                placeholder="University Name"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isConnected}
              className="px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Minting...
                </span>
              ) : (
                'Mint Certificate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InstitutionDashboard;
