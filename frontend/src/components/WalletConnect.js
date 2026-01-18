import React from 'react';

function WalletConnect({ account, isConnected, onConnect, onDisconnect }) {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div>
      {isConnected && account ? (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {formatAddress(account)}
          </span>
          <button
            onClick={onDisconnect}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default WalletConnect;
