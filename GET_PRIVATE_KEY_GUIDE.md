# How to Get Your Private Key for Deployment

## ⚠️ Security Warning

**NEVER share your private key or commit it to GitHub!**

- Use a **test wallet** with **testnet ETH only** for Sepolia deployment
- **Never use your mainnet wallet's private key**
- The private key gives **full control** over the wallet

---

## Option 1: Export from MetaMask (Existing Wallet)

### Steps:

1. **Open MetaMask** browser extension
2. **Click your account icon** (top right)
3. Go to **Settings** → **Security & Privacy**
4. Click **"Show private key"** or **"Export private key"**
5. **Enter your MetaMask password**
6. **Copy the private key** (it starts with `0x`)

### Example:
```
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

---

## Option 2: Create a New Test Wallet (Recommended)

This is safer - create a separate wallet just for testing.

### Steps:

1. **Open MetaMask**
2. Click **"Create Account"** or **"Add Account"**
3. Name it: **"EduChain Test"** or **"Sepolia Deployer"**
4. **Save the seed phrase** (12 or 24 words) in a safe place
5. **Export the private key** (same steps as Option 1)

### Why This is Better:
- ✅ Separate from your main wallet
- ✅ Only use testnet ETH
- ✅ No risk to your real funds
- ✅ Can be discarded after testing

---

## Option 3: Use Hardhat's Default Account (Localhost Only)

For **localhost development only**, Hardhat provides test accounts:

When you run `npm run node`, Hardhat generates accounts with private keys. These are **only for localhost** and won't work on Sepolia.

**Don't use these for Sepolia deployment!**

---

## What You Need for Sepolia Deployment

1. **Private Key**: From MetaMask (starts with `0x`)
2. **Sepolia ETH**: Get from [Sepolia Faucet](https://sepoliafaucet.com/)

### Get Sepolia Test ETH:

1. Go to [Alchemy Sepolia Faucet](https://sepoliafaucet.com/) or [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your **wallet address** (from MetaMask)
3. Request test ETH (usually 0.5 ETH)
4. Wait a few minutes for the transaction

---

## Update Your `.env` File

Once you have the private key, update `contracts/.env`:

```env
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/B_H2GT8OcHBx4yx9boHMn
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

**Important:**
- ✅ Start with `0x`
- ✅ 64 characters after `0x` (total 66 characters)
- ✅ Never commit this file to Git!

---

## Verify Your Wallet Has Sepolia ETH

Before deploying, check your balance:

1. Open MetaMask
2. Switch to **Sepolia Testnet** network
3. Check your wallet balance (should show Sepolia ETH)

If you don't have Sepolia ETH:
- Go to [Sepolia Faucet](https://sepoliafaucet.com/)
- Request test ETH
- Wait for confirmation

---

## Quick Checklist

- [ ] Have MetaMask installed
- [ ] Created/selected a test wallet
- [ ] Exported private key (starts with `0x`)
- [ ] Got Sepolia ETH from faucet
- [ ] Updated `contracts/.env` with RPC_URL and PRIVATE_KEY
- [ ] Verified `.env` is in `.gitignore` (not committed to Git)

---

## Next Steps

After setting up your private key:

1. **Update `contracts/.env`**:
   ```env
   RPC_URL=https://eth-sepolia.g.alchemy.com/v2/B_H2GT8OcHBx4yx9boHMn
   PRIVATE_KEY=your_private_key_here
   ```

2. **Deploy to Sepolia**:
   ```bash
   cd contracts
   npm run deploy:sepolia
   ```

3. **Copy the contract address** from the output

4. **Update environment variables** in Netlify and Render

---

## Troubleshooting

### "Insufficient funds"
- Get more Sepolia ETH from faucet
- Wait a few minutes for transaction confirmation

### "Invalid private key"
- Make sure it starts with `0x`
- Check it's exactly 66 characters total
- No extra spaces or newlines

### "Nonce too high"
- Wait a few minutes and try again
- Or manually set nonce in Hardhat config

---

**Remember**: This private key is for **testnet only**. Never use your mainnet private key! 🔒
