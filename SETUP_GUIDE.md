# Step-by-Step Setup Guide

## Step 2: Update Backend ✅

The backend has been updated to work with the new contract interface. The changes include:

- ✅ Updated contract ABI to match new interface
- ✅ Simplified `mintCertificate` function (now only needs student address and IPFS hash)
- ✅ Added IPFS hash extraction helper
- ✅ Updated to check for owner instead of authorized issuer
- ✅ Added `verifyCertificate` function

**No action needed** - the backend is already updated!

## Step 3: Test Minting

### Prerequisites

1. **Start Hardhat Node** (in Terminal 1):
   ```bash
   cd contracts
   npm run node
   ```
   Keep this running!

2. **Deploy the Contract** (in Terminal 2):
   ```bash
   cd contracts
   npm run deploy:local
   ```
   
   Copy the contract address from the output and add it to `backend/.env`:
   ```
   CONTRACT_ADDRESS=0x...
   ```

### Option A: Test Using Script (Recommended)

1. **Run the test script**:
   ```bash
   cd contracts
   npm run test:mint
   ```

   Or with custom parameters:
   ```bash
   node scripts/test-mint.js 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb QmYourIPFSHash
   ```

   The script will:
   - Check if you're the contract owner
   - Mint a test certificate
   - Verify the certificate
   - Display all certificate details

### Option B: Test Using Hardhat Console

1. **Open Hardhat console**:
   ```bash
   cd contracts
   npx hardhat console --network localhost
   ```

2. **In the console, run**:
   ```javascript
   // Get contract instance
   const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
   const contract = await CertificateNFT.attach("YOUR_CONTRACT_ADDRESS");
   
   // Get signer
   const [signer] = await ethers.getSigners();
   console.log("Signer:", signer.address);
   
   // Check if signer is owner
   const owner = await contract.owner();
   console.log("Owner:", owner);
   
   // Mint a certificate
   const studentAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
   const ipfsHash = "QmTestHash123456789";
   
   const tx = await contract.mintCertificate(studentAddress, ipfsHash);
   console.log("Tx hash:", tx.hash);
   
   const receipt = await tx.wait();
   console.log("Confirmed in block:", receipt.blockNumber);
   
   // Get token ID from event
   const event = receipt.logs.find(log => {
     try {
       const parsed = contract.interface.parseLog(log);
       return parsed && parsed.name === "CertificateMinted";
     } catch { return false; }
   });
   
   if (event) {
     const parsed = contract.interface.parseLog(event);
     const tokenId = parsed.args.tokenId;
     console.log("Token ID:", tokenId.toString());
     
     // Verify the certificate
     const [isValid, student, issueDate, hash] = await contract.verifyCertificate(tokenId);
     console.log("Valid:", isValid);
     console.log("Student:", student);
     console.log("Issue Date:", new Date(Number(issueDate) * 1000));
     console.log("IPFS Hash:", hash);
   }
   ```

### Option C: Test via Backend API

1. **Start the backend** (in Terminal 3):
   ```bash
   cd backend
   npm run dev
   ```

2. **Create a certificate via API**:
   ```bash
   curl -X POST http://localhost:5000/api/certificates \
     -H "Content-Type: application/json" \
     -d '{
       "certificateId": "TEST-001",
       "studentAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
       "studentName": "John Doe",
       "courseName": "Blockchain Fundamentals",
       "institution": "Test University",
       "tokenURI": "QmTestHash123456789",
       "mintNFT": true
     }'
   ```

   Replace `tokenURI` with your actual IPFS hash.

## Expected Output

When minting succeeds, you should see:

```
✅ Certificate minted successfully!
Token ID: 1
Student: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
IPFS Hash: QmTestHash123456789
Issue Date: 2024-01-17T...

Verification result:
  Valid: true
  Student: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
  Issue Date: 2024-01-17T...
  IPFS Hash: QmTestHash123456789

Total certificates minted: 1
```

## Troubleshooting

### Error: "Only contract owner can mint certificates"
- **Solution**: Make sure the address in `PRIVATE_KEY` in `backend/.env` matches the contract owner (deployer address)

### Error: "Contract not initialized"
- **Solution**: 
  1. Deploy the contract: `npm run deploy:local`
  2. Add `CONTRACT_ADDRESS` to `backend/.env`
  3. Restart the backend

### Error: "Blockchain node not available"
- **Solution**: Start Hardhat node: `npm run node` (keep it running)

### Error: "Student address cannot be zero"
- **Solution**: Provide a valid Ethereum address (not `0x0000...`)

## Next Steps

After successful testing:
1. ✅ Backend is updated and ready
2. ✅ Contract is deployed
3. ✅ Minting works correctly
4. 🎉 You're ready to mint real certificates!
