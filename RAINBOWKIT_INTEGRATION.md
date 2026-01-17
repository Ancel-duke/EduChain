# RainbowKit Integration Guide

## Overview

EduChain now uses **RainbowKit** with **Wagmi** for wallet connection, while maintaining **Ethers.js** for all contract interactions. This provides a modern, user-friendly wallet connection experience with full MetaMask support.

## Architecture

### Components

1. **RainbowKit Provider** (`frontend/src/providers/RainbowKitProvider.js`)
   - Wraps the app with WagmiProvider and RainbowKitProvider
   - Configures supported chains (Hardhat Local, Sepolia, Mainnet)
   - Sets up React Query for state management

2. **Custom Connect Button** (`frontend/src/components/ConnectButton.js`)
   - Minimal, grayscale-styled wallet connection UI
   - Handles connection, network switching, and account display
   - Text-based feedback (no flashy animations)

3. **Contract Hook** (`frontend/src/hooks/useContract.js`)
   - Provides contract instance using Ethers.js
   - Converts Wagmi wallet client to Ethers provider/signer

4. **Contract Helpers** (`frontend/src/utils/contractHelpers.js`)
   - `mintCertificate()` - Mint certificates via contract
   - `verifyCertificate()` - Verify certificates on-chain
   - `getContractOwner()` - Get contract owner address
   - All functions use Ethers.js for contract interactions

## Features

### ✅ Wallet Connection
- **MetaMask** support (primary)
- Automatic wallet detection
- Connection persistence across page reloads
- Network switching with visual feedback

### ✅ Contract Interactions
- **Read operations**: Verify certificates, check owner, get token data
- **Write operations**: Mint certificates (via backend API)
- **Error handling**: Graceful error messages, user-friendly feedback

### ✅ Network Management
- Automatic detection of Hardhat Local network (Chain ID: 31337)
- Network switching prompts when on wrong network
- Support for multiple networks (Local, Sepolia, Mainnet)

## Usage

### Connecting a Wallet

```jsx
import { CustomConnectButton } from './components/ConnectButton';

function MyComponent() {
  return <CustomConnectButton />;
}
```

### Using Contract in Components

```jsx
import { useContract } from './hooks/useContract';
import { verifyCertificate } from './utils/contractHelpers';

function MyComponent() {
  const contract = useContract();
  const { address, isConnected } = useAccount();

  const handleVerify = async () => {
    if (!contract) {
      console.error('Contract not available');
      return;
    }

    try {
      const result = await verifyCertificate(contract, tokenId);
      console.log('Verification:', result);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };
}
```

### Reading Contract State

```jsx
import { useAccount } from 'wagmi';
import { useContract } from './hooks/useContract';
import { getContractOwner } from './utils/contractHelpers';

function MyComponent() {
  const { address } = useAccount();
  const contract = useContract();

  useEffect(() => {
    const checkOwner = async () => {
      if (contract) {
        const owner = await getContractOwner(contract);
        console.log('Contract owner:', owner);
      }
    };
    checkOwner();
  }, [contract]);
}
```

## Environment Variables

Add to `frontend/.env`:

```env
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WALLETCONNECT_PROJECT_ID=your-project-id  # Optional, for WalletConnect
```

## Error Handling

All contract interactions include error handling:

- **Connection errors**: "Contract not initialized" or "Wallet not connected"
- **Transaction errors**: User-friendly messages from error.reason or error.message
- **Network errors**: Automatic network switching prompts

## UI/UX

- **Minimal design**: Text-based feedback, no flashy animations
- **Grayscale theme**: Consistent with EduChain design system
- **Subtle feedback**: Error messages in gray text, success states minimal
- **Network indicators**: Shows current network, prompts to switch if needed

## Dependencies

- `@rainbow-me/rainbowkit` - Wallet connection UI
- `wagmi` - React hooks for Ethereum
- `viem` - Ethereum library (used by wagmi)
- `@tanstack/react-query` - State management
- `ethers` - Contract interactions (v6)

## Migration Notes

### From useWeb3 Hook

The old `useWeb3` hook has been replaced with:
- `useAccount()` from wagmi - for account/connection state
- `useWalletClient()` from wagmi - for wallet client
- `useContract()` - for contract instance

### Contract Calls

All contract calls now go through `contractHelpers.js`:
- `mintCertificate(contract, studentAddress, ipfsHash)`
- `verifyCertificate(contract, tokenId)`
- `getContractOwner(contract)`

## Testing

1. **Start Hardhat node**: `cd contracts && npm run node`
2. **Deploy contract**: `npm run deploy:local`
3. **Start frontend**: `cd frontend && npm start`
4. **Connect wallet**: Click "Connect Wallet" button
5. **Switch network**: If prompted, switch to Hardhat Local (Chain ID: 31337)
6. **Test interactions**: Try verifying a certificate or checking owner status

## Troubleshooting

### "Contract not initialized"
- Ensure wallet is connected
- Check `REACT_APP_CONTRACT_ADDRESS` is set
- Verify you're on the correct network

### "Wrong network"
- Click the network button to switch
- Or manually add Hardhat Local network in MetaMask:
  - Chain ID: 31337
  - RPC URL: http://127.0.0.1:8545

### Wallet connection fails
- Ensure MetaMask is installed
- Check browser console for errors
- Try refreshing the page
