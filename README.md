# EduChain

A full-stack Web3 application for issuing and managing educational certificates as ERC721 NFTs on the blockchain. Built with React, Node.js, MongoDB, and Solidity smart contracts.

## Features

- **ERC721 Certificate NFTs**: Issue verifiable educational certificates as non-fungible tokens
- **IPFS Metadata Storage**: Certificate metadata stored on IPFS via Pinata
- **Off-chain Database**: MongoDB for efficient querying and metadata management
- **Clean UI**: Minimal, grayscale design inspired by Apple, Linear, and Vercel
- **Web3 Integration**: RainbowKit wallet connection supporting MetaMask and other wallets
- **Owner-Only Minting**: Only contract owner can mint certificates (secure issuance)
- **Certificate Verification**: Verify certificate authenticity on-chain
- **Non-Transferable NFTs**: Certificates cannot be transferred (prevents selling)

## Tech Stack

- **Frontend**: React (Create React App), Tailwind CSS (grayscale theme), RainbowKit, Wagmi, ethers.js
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB
- **Blockchain**: Solidity (0.8.20), Hardhat, OpenZeppelin v5
- **IPFS**: Pinata for metadata storage
- **Web3**: ethers.js v6

## Project Structure

```
EduChain/
├── frontend/          # React frontend application
├── backend/           # Express API server
├── contracts/         # Solidity smart contracts
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- MetaMask browser extension (for frontend)
- Hardhat node or access to Ethereum network (Sepolia testnet recommended)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install contract dependencies
cd ../contracts
npm install
```

### 2. Environment Configuration

#### Backend (.env)

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/educhain
FRONTEND_URL=http://localhost:3000

# Blockchain Configuration
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_contract_address_here

# IPFS/Pinata Configuration (choose one method)
PINATA_JWT=your_pinata_jwt_token
# OR
PINATA_API_KEY=your_api_key
PINATA_SECRET_KEY=your_secret_key
```

#### Frontend (.env)

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CONTRACT_ADDRESS=your_contract_address_here
REACT_APP_WALLETCONNECT_PROJECT_ID=your_project_id
```

#### Contracts (.env)

Create `contracts/.env`:

```env
# Optional: For Sepolia deployment
RPC_URL=https://sepolia.infura.io/v3/your_key
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_contract_address_here
```

### 3. Start Local Blockchain (Hardhat)

In a new terminal:

```bash
cd contracts
npm run node
```

This starts a local Hardhat node on `http://127.0.0.1:8545`.

### 4. Deploy Smart Contracts

In a new terminal:

```bash
cd contracts

# Deploy to local network
npm run deploy:local

# Or deploy to Sepolia testnet
npm run deploy:sepolia
```

After deployment, copy the contract address from the console output and add it to your `.env` files.

### 5. Configure IPFS (Pinata)

1. Sign up at [Pinata](https://pinata.cloud)
2. Get your JWT token from the API Keys section (recommended)
   - OR get API Key and Secret Key
3. Add to `backend/.env` file

### 6. Start MongoDB

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env
```

### 7. Start Backend Server

```bash
cd backend
npm start
```

The backend will run on `http://localhost:5000`.

### 8. Start Frontend

```bash
cd frontend
npm start
```

The frontend will open at `http://localhost:3000`.

## Usage

### For Institutions (Certificate Issuers)

1. **Connect Wallet**: Click "Connect Wallet" and select MetaMask
2. **Switch Network**: Ensure you're on Hardhat Local network (Chain ID: 31337)
3. **Use Owner Account**: You must use the contract owner account to mint
   - The contract owner is the address that deployed the contract
   - Check `contracts/deployments/localhost.json` for the deployer address
4. **Navigate to Dashboard**: Go to "Institution Dashboard"
5. **Fill Certificate Form**:
   - Certificate ID (unique identifier, e.g., `CERT-2024-001`)
   - Student wallet address (Ethereum address starting with `0x`)
   - Student name
   - Course name
   - Institution name
6. **Mint Certificate**: Click "Mint Certificate"
   - Metadata is automatically uploaded to IPFS
   - NFT is minted on the blockchain
   - Certificate is saved to MongoDB

### For Students

1. **Connect Wallet**: Connect your wallet to view certificates
2. **View Certificates**: Navigate to "My Certificates" to see all certificates associated with your wallet
3. **Verify Certificate**: Use the verification page to verify any certificate by token ID
4. **Certificate Details**:
   - Course information
   - Issue date
   - Token ID
   - Transaction hash
   - IPFS hash (for metadata)

## Scripts

### Contracts

```bash
cd contracts

# Compile contracts
npm run compile

# Run local Hardhat node
npm run node

# Deploy to localhost
npm run deploy:local

# Deploy to Sepolia
npm run deploy:sepolia

# Run tests
npm test
```

### Backend

```bash
cd backend

# Start server
npm start

# Start with nodemon (development)
npm run dev
```

### Frontend

```bash
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Smart Contract Details

### CertificateNFT.sol

- **Standard**: ERC721 (NFT)
- **Features**:
  - Authorized issuer system
  - Certificate metadata storage
  - Token URI support
  - Ownership verification

### Key Functions

- `mintCertificate(address student, string ipfsHash)`: Mint a new certificate NFT (owner-only)
- `verifyCertificate(uint256 tokenId)`: Verify certificate authenticity and get details
- `owner()`: Get contract owner address
- `totalSupply()`: Get total number of certificates minted
- `certificateIssueDate(uint256 tokenId)`: Get certificate issue date
- `certificateStudent(uint256 tokenId)`: Get student address for a certificate

## API Endpoints

See [backend/API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md) for complete API documentation.

### Certificates

- `POST /api/certificates/mint` - Mint a new certificate NFT with IPFS upload
- `GET /api/certificates/verify/:tokenId` - Verify a certificate by token ID
- `GET /api/certificates` - Get all certificates (optional filters: `studentAddress`)
- `GET /api/certificates/:id` - Get specific certificate by ID

### Students

- `GET /api/students` - Get all students
- `GET /api/students/:address` - Get student by wallet address
- `POST /api/students` - Create or update student

## Development Notes

- **Design System**: Strict grayscale theme (white and gray only), no animations or gradients
- **UI Inspiration**: Clean, minimal design inspired by Apple, Linear, and Vercel
- **Wallet Connection**: RainbowKit integration for seamless wallet connection
- **Contract Interaction**: Uses ethers.js v6 with provider-based read calls
- **IPFS Integration**: Automatic metadata upload to IPFS via Pinata
- **Service-Controller Pattern**: Backend follows service-controller architecture
- **Error Handling**: Comprehensive error handling with structured JSON responses
- **Security**: Owner-only minting, input validation, ReentrancyGuard protection

## Troubleshooting

### "Access Denied" on Dashboard
- Ensure you're using the contract owner account (check `contracts/deployments/localhost.json`)
- Verify you're on Hardhat Local network (Chain ID: 31337)
- Check that contract address matches in both frontend and backend `.env` files

### "Contract not initialized" error
- Ensure Hardhat node is running (`npm run node` in contracts/)
- Verify contract is deployed (`npm run deploy:local`)
- Check `CONTRACT_ADDRESS` is set correctly in `.env` files

### Wallet connection issues
- Install MetaMask browser extension
- Ensure you're on Hardhat Local network (Chain ID: 31337)
- Check browser console for errors
- Try refreshing the page after connecting wallet

### "IPFS upload failed"
- Verify Pinata credentials are set in `backend/.env`
- Check that `PINATA_JWT` or `PINATA_API_KEY`/`PINATA_SECRET_KEY` are correct
- Ensure Pinata account is active

### MongoDB connection errors
- Verify MongoDB is running (local) or connection string is correct (Atlas)
- Check `MONGODB_URI` in `backend/.env`
- Ensure network access if using cloud MongoDB

### "Certificate ID already exists"
- Use a unique certificate ID for each certificate
- Certificate IDs must be unique across all certificates

### Frontend can't reach backend
- Verify backend is running on port 5000
- Check `REACT_APP_API_URL` in `frontend/.env`
- Ensure CORS is configured correctly in `backend/server.js`

## License

MIT

## Contributing

This is a clean, production-ready setup. Focus on correctness, clarity, and scalability when extending the codebase.
