# Step-by-Step Guide: Setup Sepolia Testnet

This guide will help you:
1. Switch MetaMask to Sepolia Testnet
2. Check your Sepolia ETH balance
3. Get Sepolia test ETH from a faucet

---

## Step 1: Switch MetaMask to Sepolia Testnet

### Option A: If Sepolia is Already Added

1. **Open MetaMask** (click the extension icon in your browser)
2. **Click the network dropdown** at the top (it might say "Ethereum Mainnet" or "Hardhat Local")
3. **Scroll down** and click **"Sepolia"** or **"Sepolia test network"**
4. MetaMask will switch to Sepolia Testnet

### Option B: Add Sepolia Testnet (If Not Visible)

1. **Open MetaMask**
2. **Click the network dropdown** at the top
3. **Click "Add network"** or **"Add a network manually"**
4. Enter these details:
   - **Network name**: `Sepolia`
   - **RPC URL**: `https://rpc.sepolia.org`
   - **Chain ID**: `11155111`
   - **Currency symbol**: `ETH`
   - **Block explorer URL**: `https://sepolia.etherscan.io`
5. **Click "Save"**
6. MetaMask will switch to Sepolia automatically

---

## Step 2: Check Your Sepolia ETH Balance

1. **Make sure you're on Sepolia Testnet** (check the network dropdown at the top)
2. **Look at your wallet address** - it should show `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (or your account address)
3. **Check the balance** - it will show something like:
   - `0 ETH` (if you don't have any)
   - `0.5 ETH` (if you already have test ETH)

**If you see `0 ETH` or a very small amount, proceed to Step 3.**

---

## Step 3: Get Sepolia ETH from Faucet

You need Sepolia ETH to pay for gas fees when deploying contracts. Here are several faucet options:

### Option A: Alchemy Sepolia Faucet (Recommended)

1. **Go to**: [https://sepoliafaucet.com/](https://sepoliafaucet.com/)
2. **Sign in with Alchemy** (use the same account you used for the RPC URL)
3. **Enter your wallet address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
   - Or copy it from MetaMask: Click your account name → Copy address
4. **Click "Send Me ETH"**
5. **Wait 1-2 minutes** for the transaction to complete
6. **Check MetaMask** - your balance should update to show Sepolia ETH

### Option B: QuickNode Sepolia Faucet

1. **Go to**: [https://faucet.quicknode.com/ethereum/sepolia](https://faucet.quicknode.com/ethereum/sepolia)
2. **Enter your wallet address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
3. **Complete any CAPTCHA** if prompted
4. **Click "Send Me ETH"**
5. **Wait 1-2 minutes** and check MetaMask

### Option C: Infura Sepolia Faucet

1. **Go to**: [https://www.infura.io/faucet/sepolia](https://www.infura.io/faucet/sepolia)
2. **Sign in with Infura** (or create a free account)
3. **Enter your wallet address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
4. **Request test ETH**
5. **Wait and check MetaMask**

### Option D: Chainlink Sepolia Faucet

1. **Go to**: [https://faucets.chain.link/sepolia](https://faucets.chain.link/sepolia)
2. **Connect your wallet** (click "Connect Wallet" and approve in MetaMask)
3. **Click "Send request"**
4. **Wait for confirmation**

---

## Step 4: Verify You Have Sepolia ETH

1. **In MetaMask**, make sure you're on **Sepolia Testnet**
2. **Check your balance** - you should see something like:
   - `0.5 ETH` ✅ (Good! You're ready to deploy)
   - `0 ETH` ❌ (Try another faucet or wait a bit longer)

**Minimum needed**: About `0.01 ETH` should be enough for deployment, but most faucets give `0.5 ETH` which is plenty.

---

## Troubleshooting

### "Network not found" in MetaMask
- Make sure you've added Sepolia network (see Step 1, Option B)
- Try refreshing MetaMask or restarting your browser

### Faucet says "Address already used" or "Rate limit"
- Wait 24 hours and try again
- Try a different faucet
- Some faucets have daily limits

### "Insufficient funds" when deploying
- Make sure you're on Sepolia Testnet (not Mainnet!)
- Check your balance is above `0.01 ETH`
- Wait a few more minutes for faucet transaction to confirm

### Transaction stuck or pending
- Check on [Sepolia Etherscan](https://sepolia.etherscan.io/)
- Enter your address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Look for recent transactions

---

## Quick Checklist

Before deploying to Sepolia, make sure:

- [ ] MetaMask is switched to **Sepolia Testnet**
- [ ] Your wallet address is visible: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- [ ] You have Sepolia ETH (at least `0.01 ETH`, preferably `0.5 ETH`)
- [ ] You've copied your private key from MetaMask
- [ ] You've updated `contracts/.env` with:
  - `RPC_URL=https://eth-sepolia.g.alchemy.com/v2/B_H2GT8OcHBx4yx9boHMn`
  - `PRIVATE_KEY=0xYourPrivateKeyHere`

---

## Next Steps

Once you have Sepolia ETH:

1. **Update `contracts/.env`** with your RPC URL and private key
2. **Deploy to Sepolia**:
   ```bash
   cd contracts
   npm run deploy:sepolia
   ```
3. **Copy the contract address** from the output
4. **Update environment variables** in Netlify and Render

---

## Your Wallet Address

For reference, your wallet address is:
```
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

You can:
- **View on Sepolia Explorer**: [https://sepolia.etherscan.io/address/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266](https://sepolia.etherscan.io/address/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
- **Copy from MetaMask**: Click account name → "Copy address to clipboard"

---

**Ready to deploy?** Once you have Sepolia ETH, proceed to the deployment guide! 🚀
