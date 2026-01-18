import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { CustomConnectButton } from '../components/ConnectButton';

function Home() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-12 py-20">
        <div className="space-y-6">
          <h1 className="text-5xl font-light text-gray-900 tracking-tight">
            EduChain
          </h1>
          <p className="text-lg text-gray-600 font-light leading-relaxed max-w-xl mx-auto">
            Verifiable academic certificates on the blockchain.
            Immutable, transparent, and permanently accessible.
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <div className="flex justify-center">
            <CustomConnectButton />
          </div>

          {isConnected && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                Institution Dashboard
              </button>
              <button
                onClick={() => navigate('/verify')}
                className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                Verify Certificate
              </button>
            </div>
          )}
        </div>

        <div className="pt-12 border-t border-gray-200 space-y-2">
          <p className="text-sm text-gray-500">
            Each certificate is minted as an NFT and stored permanently on the blockchain
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
