import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { createContractFromWalletClient } from '../utils/contractHelpers';

/**
 * Hook to get contract instance with ethers.js
 * Uses wagmi's wallet client to create ethers signer
 */
export function useContract() {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [contract, setContract] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const initContract = async () => {
      if (!isConnected || !walletClient) {
        setContract(null);
        return;
      }

      try {
        const contractInstance = await createContractFromWalletClient(walletClient);
        if (!cancelled) {
          setContract(contractInstance);
        }
      } catch (error) {
        console.error('[useContract] Error initializing contract:', error);
        if (!cancelled) {
          setContract(null);
        }
      }
    };

    initContract();

    return () => {
      cancelled = true;
    };
  }, [isConnected, walletClient]);

  return contract;
}
