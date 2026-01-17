# Quick Start Guide

## ⚠️ Important: Start Hardhat Node First!

The contract needs a running Hardhat node to interact with it.

## Step-by-Step Instructions

### 1. Start Hardhat Node (Terminal 1)
```bash
cd contracts
npm run node
```
**Keep this terminal running!** This is your local blockchain.

### 2. Deploy Contract (Terminal 2 - NEW terminal)
```bash
cd contracts
npm run deploy:local
```

You should see:
```
CertificateNFT deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 3. Add Contract Address to .env
The contract address is already in `contracts/.env`:
```
CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 4. Test Minting (Terminal 2)
```bash
cd contracts
npm run test:mint
```

Or with custom values:
```bash
node scripts/test-mint.js 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb QmYourIPFSHash
```

## Troubleshooting

### Error: "could not decode result data"
- **Cause**: Hardhat node is not running
- **Solution**: Start Hardhat node in a separate terminal: `npm run node`

### Error: "CONTRACT_ADDRESS not set"
- **Solution**: Run `npm run deploy:local` first, then the address is automatically saved

### Error: "Only contract owner can mint"
- **Cause**: The signer address doesn't match the contract owner
- **Solution**: Make sure you're using the same account that deployed the contract

## Current Status

✅ Contract deployed: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
✅ Contract address saved to `.env`
⏳ **Next**: Start Hardhat node, then test minting
