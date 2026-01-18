import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

/**
 * Custom styled connect button using RainbowKit
 * Minimal, text-based styling to match grayscale theme
 */
export function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="px-8 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported || (chain.id !== 31337 && chain.id !== 1 && chain.id !== 11155111)) {
                return (
                  <div className="flex flex-col items-center space-y-2">
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                    >
                      Switch to Hardhat Local Network
                    </button>
                    <p className="text-xs text-gray-500">Current: {chain.name} (Chain ID: {chain.id})</p>
                  </div>
                );
              }

              return (
                <div className="inline-flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600 font-mono">
                      {account.displayName}
                    </span>
                    <span className="text-xs text-gray-500">{chain.name}</span>
                  </div>
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="text-xs text-gray-500 hover:text-gray-700"
                    title="Switch network"
                  >
                    Switch
                  </button>
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Disconnect
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
