const { ethers } = require("ethers");
require("dotenv").config();

// Contract ABI (simplified - in production, import from artifacts)
const CONTRACT_ABI = [
  "function mintCertificate(address student, string memory ipfsHash) external returns (uint256)",
  "function verifyCertificate(uint256 tokenId) external view returns (bool isValid, address student, uint256 issueDate, string memory ipfsHash)",
  "function totalSupply() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function getCertificateOwner(uint256 tokenId) external view returns (address owner)",
  "function certificateIssueDate(uint256 tokenId) external view returns (uint256)",
  "function certificateStudent(uint256 tokenId) external view returns (address)",
  "event CertificateMinted(uint256 indexed tokenId, address indexed student, string ipfsHash, uint256 issueDate)",
];

let provider;
let signer;
let contract;

/**
 * Initialize blockchain connection
 * This function is called on module load but won't crash if blockchain is unavailable
 */
async function initBlockchain() {
  // Skip initialization if no RPC_URL or CONTRACT_ADDRESS is set
  if (!process.env.RPC_URL && !process.env.CONTRACT_ADDRESS) {
    return;
  }

  try {
    // Only initialize if RPC_URL is explicitly set (not localhost)
    const rpcUrl = process.env.RPC_URL;
    
    if (!rpcUrl || rpcUrl.includes('127.0.0.1') || rpcUrl.includes('localhost')) {
      console.log("Blockchain disabled: No RPC_URL set or using localhost (not available on cloud)");
      console.log("To enable: Set RPC_URL to a valid testnet/mainnet endpoint (e.g., Infura, Alchemy)");
      return;
    }
    
    // Create provider - will retry but we'll catch errors
    provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
      staticNetwork: false, // Allow network detection
    });

    // Test connection with timeout to prevent hanging
    try {
      const blockNumber = await Promise.race([
        provider.getBlockNumber(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ]);
      console.log("Blockchain connected. Latest block:", blockNumber);
    } catch (connError) {
      console.warn("Blockchain node not available. NFT minting will be disabled.");
      console.warn("Error:", connError.message);
      console.warn("To enable: Set RPC_URL to a valid endpoint (e.g., Infura, Alchemy)");
      provider = null;
      return;
    }

    if (process.env.PRIVATE_KEY) {
      signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    } else {
      // For local development, use first account from hardhat node
      console.warn("No PRIVATE_KEY found, using provider default signer");
      try {
        signer = await provider.getSigner();
      } catch (signerError) {
        console.warn("Could not get signer. NFT minting will be disabled.");
        return;
      }
    }

    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (contractAddress) {
      contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      console.log("Blockchain connection initialized. Contract address:", contractAddress);
    } else {
      console.warn("No CONTRACT_ADDRESS found in environment variables. NFT minting will be disabled.");
    }
  } catch (error) {
    console.warn("Error initializing blockchain (non-fatal):", error.message);
    console.warn("Server will continue running, but NFT minting will be disabled.");
  }
}

/**
 * Extract IPFS hash from tokenURI
 * Handles both "ipfs://QmXxxx..." and "QmXxxx..." formats
 */
function extractIPFSHash(tokenURI) {
  if (!tokenURI) {
    throw new Error("Token URI is required");
  }
  
  // Remove "ipfs://" prefix if present
  if (tokenURI.startsWith("ipfs://")) {
    return tokenURI.substring(7);
  }
  
  // If it's a full URL, try to extract hash
  if (tokenURI.includes("/ipfs/")) {
    const parts = tokenURI.split("/ipfs/");
    return parts[parts.length - 1];
  }
  
  // Assume it's already just the hash
  return tokenURI;
}

/**
 * Mint a certificate NFT
 * @param {string} studentAddress - Student's wallet address
 * @param {string} tokenURI - IPFS hash or URI (will extract hash automatically)
 * @returns {Promise<{tokenId: number, txHash: string}>}
 */
async function mintCertificate(studentAddress, tokenURI) {
  if (!contract) {
    throw new Error("Contract not initialized. Ensure CONTRACT_ADDRESS is set in .env and blockchain node is running");
  }

  if (!provider) {
    throw new Error("Blockchain provider not available. Start Hardhat node or configure RPC_URL");
  }

  try {
    // Check if signer is the owner (only owner can mint)
    const signerAddress = await signer.getAddress();
    
    // Use provider for read-only calls to avoid signer issues
    let owner;
    try {
      // Try with provider first (read-only, more reliable)
      const readOnlyContract = new ethers.Contract(contract.target, CONTRACT_ABI, provider);
      owner = await readOnlyContract.owner();
    } catch (providerError) {
      // Fallback to signer-based contract
      owner = await contract.owner();
    }
    
    if (signerAddress.toLowerCase() !== owner.toLowerCase()) {
      throw new Error("Only contract owner can mint certificates. Current signer is not the owner.");
    }

    // Extract IPFS hash from tokenURI
    const ipfsHash = extractIPFSHash(tokenURI);

    // Mint the certificate with simplified interface
    const tx = await contract.mintCertificate(studentAddress, ipfsHash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    // Get token ID from event
    const event = receipt.logs.find(
      (log) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed && parsed.name === "CertificateMinted";
        } catch {
          return false;
        }
      }
    );

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
    console.error("Error minting certificate:", error);
    throw error;
  }
}

/**
 * Verify certificate from blockchain
 * @param {number} tokenId - Token ID
 * @returns {Promise<Object>}
 */
async function verifyCertificate(tokenId) {
  if (!contract) {
    throw new Error("Contract not initialized");
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
    console.error("Error verifying certificate from blockchain:", error);
    throw error;
  }
}

/**
 * Get certificate details from blockchain (legacy function for compatibility)
 * @param {number} tokenId - Token ID
 * @returns {Promise<Object>}
 */
async function getCertificate(tokenId) {
  if (!contract) {
    throw new Error("Contract not initialized");
  }

  try {
    // Use verifyCertificate to get all details
    const verification = await verifyCertificate(tokenId);
    const owner = await contract.getCertificateOwner(tokenId);
    
    return {
      student: verification.student,
      owner,
      issueDate: verification.issueDate,
      ipfsHash: verification.ipfsHash,
      isValid: verification.isValid,
    };
  } catch (error) {
    console.error("Error fetching certificate from blockchain:", error);
    throw error;
  }
}

// Initialize on module load (async, won't block)
// Only initialize if RPC_URL is set and not localhost
const rpcUrl = process.env.RPC_URL;
if (rpcUrl && !rpcUrl.includes('127.0.0.1') && !rpcUrl.includes('localhost')) {
  initBlockchain().catch((err) => {
    // Silently fail - blockchain is optional
    console.warn("Blockchain initialization failed:", err.message);
  });
} else {
  console.log("Blockchain initialization skipped: RPC_URL not set or using localhost");
}

module.exports = {
  mintCertificate,
  verifyCertificate,
  getCertificate,
  initBlockchain,
};
