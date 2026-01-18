import { ethers } from 'ethers';

const CONTRACT_ABI = [
  "function mintCertificate(address student, string memory ipfsHash) external returns (uint256)",
  "function verifyCertificate(uint256 tokenId) external view returns (bool isValid, address student, uint256 issueDate, string memory ipfsHash)",
  "function totalSupply() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function getCertificateOwner(uint256 tokenId) external view returns (address owner)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function certificateIssueDate(uint256 tokenId) external view returns (uint256)",
  "function certificateStudent(uint256 tokenId) external view returns (address)",
  "event CertificateMinted(uint256 indexed tokenId, address indexed student, string ipfsHash, uint256 issueDate)",
];

/**
 * Create contract instance from wallet client (wagmi) using ethers.js
 * @param {Object} walletClient - Wagmi wallet client
 * @returns {ethers.Contract|null} Contract instance or null
 */
export async function createContractFromWalletClient(walletClient) {
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  
  console.log('[CONTRACT] Creating contract instance...', {
    contractAddress,
    hasWalletClient: !!walletClient,
  });
  
  if (!contractAddress) {
    console.error('[CONTRACT] REACT_APP_CONTRACT_ADDRESS not set in .env');
    return null;
  }
  
  if (!walletClient) {
    console.error('[CONTRACT] Wallet client not available');
    return null;
  }

  try {
    // Convert wagmi wallet client to ethers provider and signer
    const provider = new ethers.BrowserProvider(walletClient);
    const signer = await provider.getSigner(); // await the signer in ethers v6
    
    // Create contract with signer for write operations
    // Store provider separately for read operations if needed
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
    contract._provider = provider; // Store provider for read-only calls
    
    console.log('[CONTRACT] Contract instance created:', contract.target);
    return contract;
  } catch (error) {
    console.error('[CONTRACT] Error creating contract instance:', error);
    return null;
  }
}

/**
 * Mint certificate using contract
 * @param {ethers.Contract} contract - Contract instance
 * @param {string} studentAddress - Student wallet address
 * @param {string} ipfsHash - IPFS hash
 * @returns {Promise<{tokenId: number, txHash: string}>}
 */
export async function mintCertificate(contract, studentAddress, ipfsHash) {
  if (!contract) {
    throw new Error('Contract not initialized');
  }

  try {
    const tx = await contract.mintCertificate(studentAddress, ipfsHash);
    const receipt = await tx.wait();

    // Get token ID from event
    const event = receipt.logs.find((log) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed && parsed.name === 'CertificateMinted';
      } catch {
        return false;
      }
    });

    let tokenId;
    if (event) {
      const parsed = contract.interface.parseLog(event);
      tokenId = Number(parsed.args.tokenId);
    } else {
      // Fallback: get total supply
      const totalSupply = await contract.totalSupply();
      tokenId = Number(totalSupply);
    }

    return {
      tokenId,
      txHash: receipt.hash,
    };
  } catch (error) {
    console.error('Error minting certificate:', error);
    throw new Error(error.reason || error.message || 'Failed to mint certificate');
  }
}

/**
 * Verify certificate using contract
 * @param {ethers.Contract} contract - Contract instance
 * @param {number} tokenId - Token ID
 * @returns {Promise<Object>} Verification result
 */
export async function verifyCertificate(contract, tokenId) {
  if (!contract) {
    throw new Error('Contract not initialized');
  }

  // Validate token ID before contract call
  if (!Number.isInteger(tokenId) || tokenId <= 0) {
    throw new Error('Invalid token ID. Token ID must be a positive integer.');
  }

  if (tokenId > Number.MAX_SAFE_INTEGER) {
    throw new Error('Token ID is too large');
  }

  try {
    const [isValid, student, issueDate, ipfsHash] = await contract.verifyCertificate(tokenId);
    
    return {
      isValid,
      student,
      issueDate: new Date(Number(issueDate) * 1000),
      ipfsHash,
    };
  } catch (error) {
    console.error('Error verifying certificate:', error);
    throw new Error(error.reason || error.message || 'Failed to verify certificate');
  }
}

/**
 * Get contract owner
 * @param {ethers.Contract} contract - Contract instance
 * @returns {Promise<string>} Owner address
 */
export async function getContractOwner(contract) {
  if (!contract) {
    throw new Error('Contract not initialized');
  }

  try {
    console.log('[CONTRACT] Calling owner() on contract:', contract.target);
    
    // Try using provider directly for read-only calls
    if (contract._provider) {
      try {
        const readOnlyContract = new ethers.Contract(contract.target, CONTRACT_ABI, contract._provider);
        const owner = await readOnlyContract.owner();
        console.log('[CONTRACT] Owner result (via provider):', owner);
        return owner;
      } catch (providerError) {
        console.log('[CONTRACT] Provider call failed, trying signer...', providerError.message);
      }
    }
    
    // Fallback: try with signer (might work if signer supports read calls)
    const owner = await contract.owner();
    console.log('[CONTRACT] Owner result (via signer):', owner);
    return owner;
  } catch (error) {
    console.error('[CONTRACT] Error getting owner:', error);
    console.error('[CONTRACT] Error details:', {
      code: error.code,
      reason: error.reason,
      message: error.message,
      data: error.data,
    });
    
    // Provide user-friendly error messages
    if (error.code === 'CALL_EXCEPTION' || error.code === 'BAD_DATA') {
      throw new Error('Contract not found on this network. Please ensure: 1) You are connected to the correct network (Hardhat Local for development), 2) The contract is deployed to this network, 3) The contract address is correct.');
    }
    
    throw new Error(error.reason || error.message || 'Failed to get contract owner');
  }
}
