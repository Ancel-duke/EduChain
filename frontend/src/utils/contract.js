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

let contractInstance = null;

/**
 * Switch MetaMask to localhost network (Hardhat)
 */
export async function switchToLocalhost() {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  const chainId = '0x7A69'; // 31337 in hex (Hardhat default)
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId,
              chainName: 'Hardhat Local',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['http://127.0.0.1:8545'],
              blockExplorerUrls: null,
            },
          ],
        });
      } catch (addError) {
        throw new Error('Failed to add localhost network to MetaMask');
      }
    } else {
      throw switchError;
    }
  }
}

/**
 * Check if connected to localhost network
 */
export async function isLocalhostNetwork() {
  if (!window.ethereum) return false;
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    return network.chainId === 31337n; // Hardhat chain ID
  } catch (error) {
    return false;
  }
}

export async function getContract() {
  if (contractInstance) {
    return contractInstance;
  }

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.warn('Contract address not set in environment variables');
    return null;
  }

  if (!window.ethereum) {
    console.warn('No Web3 provider found');
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Check if we're on the right network
    const network = await provider.getNetwork();
    if (network.chainId !== 31337n) {
      console.warn('Not connected to localhost network. Chain ID:', network.chainId);
      // Don't throw, just warn - user can switch manually
    }
    
    const signer = await provider.getSigner();
    contractInstance = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
    
    // Test if contract exists by trying to read a simple value
    try {
      await contractInstance.totalSupply();
    } catch (testError) {
      console.error('Contract not found at address. Make sure:', {
        address: contractAddress,
        network: network.name,
        chainId: network.chainId.toString(),
        expectedChainId: '31337 (localhost)'
      });
      contractInstance = null;
      return null;
    }
    
    return contractInstance;
  } catch (error) {
    console.error('Error initializing contract:', error);
    return null;
  }
}

export function getContractAddress() {
  return process.env.REACT_APP_CONTRACT_ADDRESS;
}
