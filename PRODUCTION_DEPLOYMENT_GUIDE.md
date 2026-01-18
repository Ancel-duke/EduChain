# Production Deployment Guide for EduChain

## Current Issue

Your frontend is deployed on Netlify, but it's trying to connect to a contract on **Hardhat Localhost** (`http://127.0.0.1:8545`), which is **not accessible from production**.

**Error**: `Contract not found on this network` or `missing revert data`

This happens because:
- ✅ Frontend is deployed on Netlify (production)
- ✅ Backend is deployed on Render (production)
- ❌ Contract is only on Hardhat Localhost (not accessible from production)

---

## Solution Options

### Option 1: Deploy Contract to Sepolia Testnet (Recommended for Testing)

This allows you to test the full production setup on a public testnet.

#### Step 1: Get Ethereum Sepolia Testnet RPC URL

**⚠️ Important**: You need **Ethereum Sepolia**, NOT Base Sepolia. They are different networks!

1. Sign up for a free account at:
   - [Alchemy](https://www.alchemy.com/) (recommended)
   - [Infura](https://www.infura.io/)
   - [QuickNode](https://www.quicknode.com/)

2. In Alchemy Dashboard:
   - Click **"Create App"** or **"Add App"**
   - **Name**: `EduChain Sepolia` (or any name)
   - **Chain**: Select **"Ethereum"** (not Base!)
   - **Network**: Select **"Sepolia"** (not Base Sepolia!)
   - Click **"Create App"**

3. After creating, click on your app
4. Copy the **HTTPS RPC URL** from the "View Key" section
   - Should look like: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`
   - **NOT**: `https://base-sepolia.g.alchemy.com/v2/...` (this is wrong!)

**Quick Check**: The URL should contain `eth-sepolia`, not `base-sepolia`

#### Step 2: Get Sepolia Testnet ETH

You'll need Sepolia ETH to deploy:
1. Go to [Sepolia Faucet](https://sepoliafaucet.com/) or [Alchemy Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address (the one you'll use to deploy)
3. Request test ETH (usually 0.5 ETH)

#### Step 3: Update Environment Variables

**In `contracts/.env`:**
```env
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_wallet_private_key_here
```

**Important**: Use a **test wallet** with **testnet ETH only**. Never use your mainnet private key!

#### Step 4: Deploy to Sepolia

```bash
cd contracts
npm run deploy:sepolia
```

This will:
- Compile the contract
- Deploy to Sepolia testnet
- Save the contract address to `contracts/deployments/sepolia.json`

#### Step 5: Update Frontend Environment Variables

**In Netlify Dashboard:**
1. Go to **Site settings** → **Environment variables**
2. Update `REACT_APP_CONTRACT_ADDRESS` with the new Sepolia contract address
3. **Trigger a redeploy**

#### Step 6: Update Backend Environment Variables

**In Render Dashboard:**
1. Go to your backend service → **Environment** tab
2. Update:
   - `RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`
   - `CONTRACT_ADDRESS=your_sepolia_contract_address`
   - `PRIVATE_KEY=your_wallet_private_key` (same as contracts/.env)
3. **Redeploy** the backend

#### Step 7: Update RainbowKit Provider

The frontend already supports Sepolia, but verify the network configuration in `frontend/src/providers/RainbowKitProvider.js` includes Sepolia.

#### Step 8: Test

1. Visit your Netlify site
2. Connect MetaMask
3. Switch to **Sepolia Testnet** in MetaMask
4. Try accessing the dashboard

---

### Option 2: Use Localhost Only (For Development)

If you only want to develop locally:

1. **Run everything locally:**
   ```bash
   # Terminal 1: Hardhat node
   cd contracts
   npm run node

   # Terminal 2: Backend
   cd backend
   npm start

   # Terminal 3: Frontend
   cd frontend
   npm start
   ```

2. **Access at**: `http://localhost:3000`

3. **Don't use the Netlify/Render deployments** for blockchain features

---

### Option 3: Deploy to Mainnet (For Production)

**⚠️ Only do this when you're ready for production!**

1. Follow Option 1 steps, but:
   - Use **Mainnet** RPC URL (not Sepolia)
   - Use **real ETH** (costs money!)
   - Use a **secure wallet** with proper key management
   - Test thoroughly on Sepolia first

2. Update all environment variables to mainnet addresses

3. Deploy contract:
   ```bash
   cd contracts
   npm run deploy:mainnet  # (you'll need to create this script)
   ```

---

## Quick Fix: Update Error Message

I've already updated the error message to be more user-friendly. After Netlify redeploys, users will see:

> ⚠️ Production Deployment Notice:
> 
> This app is configured for local development (Hardhat Local network). 
> The contract address points to a localhost deployment that is not accessible from production.
> 
> **Options:**
> - Use the app on localhost (http://localhost:3000) for development
> - Deploy the contract to a testnet (Sepolia) and update the contract address
> - Deploy the contract to mainnet for production use

---

## Recommended Approach

**For Testing/Development:**
- Use **Option 1** (Sepolia Testnet)
- Free to use
- Publicly accessible
- Good for testing production setup

**For Production:**
- Use **Option 3** (Mainnet)
- Requires real ETH
- Permanent and public
- Use after thorough testing

---

## Environment Variables Summary

### After Deploying to Sepolia:

**Frontend (Netlify):**
```env
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_CONTRACT_ADDRESS=0x... (Sepolia address)
REACT_APP_WALLETCONNECT_PROJECT_ID=
```

**Backend (Render):**
```env
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_test_wallet_private_key
CONTRACT_ADDRESS=0x... (Sepolia address)
MONGODB_URI=your_mongodb_uri
PINATA_JWT=your_pinata_jwt
```

**Contracts (.env):**
```env
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_test_wallet_private_key
CONTRACT_ADDRESS=0x... (auto-generated after deployment)
```

---

## Next Steps

1. **Choose your approach** (Sepolia recommended for testing)
2. **Deploy contract to Sepolia** (follow Option 1)
3. **Update environment variables** in Netlify and Render
4. **Test the full flow** on production URLs
5. **Verify everything works** end-to-end

---

## Troubleshooting

### "Contract not found" after deploying to Sepolia
- Verify contract address is correct
- Ensure you're connected to Sepolia in MetaMask
- Check that contract was deployed successfully (check transaction on Sepolia explorer)

### "Insufficient funds" when deploying
- Get more Sepolia ETH from faucet
- Verify you have enough for gas fees

### Backend can't connect to Sepolia
- Verify RPC URL is correct
- Check that RPC endpoint is active
- Ensure private key matches the deployer wallet

---

Your app is now deployed, but needs the contract on a public network to work in production! 🚀
