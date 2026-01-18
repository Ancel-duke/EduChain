const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.error("Error: CONTRACT_ADDRESS not set in .env");
    process.exit(1);
  }

  const [signer] = await hre.ethers.getSigners();
  console.log("Checking with account:", signer.address);

  const CertificateNFT = await hre.ethers.getContractFactory("CertificateNFT");
  const contract = CertificateNFT.attach(contractAddress);

  const owner = await contract.owner();
  console.log("\n=== Contract Owner Info ===");
  console.log("Contract Address:", contractAddress);
  console.log("Contract Owner:", owner);
  console.log("Your Address:", signer.address);
  console.log("Are you the owner?", owner.toLowerCase() === signer.address.toLowerCase() ? "✅ YES" : "❌ NO");
  
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    console.log("\n⚠️  You are not the contract owner!");
    console.log("To mint certificates, you need to connect with address:", owner);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
