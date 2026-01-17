const hre = require("hardhat");
require("dotenv").config();

/**
 * Test script to mint a certificate NFT
 * 
 * Usage:
 *   node scripts/test-mint.js <student-address> <ipfs-hash>
 * 
 * Example:
 *   node scripts/test-mint.js 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb QmXxxx...
 */

async function main() {
  // Connect to localhost network explicitly
  const provider = new hre.ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner(0);
  const deployer = signer;
  
  console.log("Testing CertificateNFT minting...");
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(await provider.getBalance(deployer.address)), "ETH");

  // Get contract address from deployment or environment
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("Error: CONTRACT_ADDRESS not set in .env");
    console.log("Deploy the contract first: npm run deploy:local");
    process.exit(1);
  }

  console.log("\nContract address:", contractAddress);

  // Get contract instance
  const CertificateNFT = await hre.ethers.getContractFactory("CertificateNFT", signer);
  const certificateNFT = CertificateNFT.attach(contractAddress);

  // Verify deployer is the owner
  const owner = await certificateNFT.owner();
  console.log("Contract owner:", owner);
  
  if (deployer.address.toLowerCase() !== owner.toLowerCase()) {
    console.error("Error: Deployer is not the contract owner!");
    console.log("Only the owner can mint certificates.");
    process.exit(1);
  }

  // Get arguments from command line or use defaults
  let studentAddress = process.argv[2] || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Account #1 from Hardhat
  const ipfsHash = process.argv[3] || "QmTestHash123456789";

  // Ensure address is properly formatted (trim and validate)
  studentAddress = studentAddress.trim();
  if (!studentAddress.startsWith("0x")) {
    studentAddress = "0x" + studentAddress;
  }
  
  // Validate address format (42 chars: 0x + 40 hex)
  if (!hre.ethers.isAddress(studentAddress)) {
    throw new Error(`Invalid Ethereum address: ${studentAddress}`);
  }

  console.log("\nMinting certificate...");
  console.log("Student address:", studentAddress);
  console.log("IPFS hash:", ipfsHash);

  try {
    // Mint the certificate (use getAddress to ensure proper format)
    const tx = await certificateNFT.mintCertificate(studentAddress, ipfsHash);
    console.log("\nTransaction sent:", tx.hash);
    console.log("Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    // Get token ID from event
    const event = receipt.logs.find(
      (log) => {
        try {
          const parsed = certificateNFT.interface.parseLog(log);
          return parsed && parsed.name === "CertificateMinted";
        } catch {
          return false;
        }
      }
    );

    if (event) {
      const parsed = certificateNFT.interface.parseLog(event);
      const tokenId = parsed.args.tokenId;
      console.log("\n✅ Certificate minted successfully!");
      console.log("Token ID:", tokenId.toString());
      console.log("Student:", parsed.args.student);
      console.log("IPFS Hash:", parsed.args.ipfsHash);
      console.log("Issue Date:", new Date(Number(parsed.args.issueDate) * 1000).toISOString());

      // Verify the certificate
      console.log("\nVerifying certificate...");
      const [isValid, student, issueDate, hash] = await certificateNFT.verifyCertificate(tokenId);
      console.log("Verification result:");
      console.log("  Valid:", isValid);
      console.log("  Student:", student);
      console.log("  Issue Date:", new Date(Number(issueDate) * 1000).toISOString());
      console.log("  IPFS Hash:", hash);

      // Get total supply
      const totalSupply = await certificateNFT.totalSupply();
      console.log("\nTotal certificates minted:", totalSupply.toString());
    } else {
      console.log("⚠️  Certificate minted but event not found");
      const totalSupply = await certificateNFT.totalSupply();
      console.log("Total supply:", totalSupply.toString());
    }
  } catch (error) {
    console.error("\n❌ Error minting certificate:");
    console.error(error.message);
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
