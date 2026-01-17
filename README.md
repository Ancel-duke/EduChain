# EduChain

A full-stack Web3 application for issuing and managing educational certificates as ERC721 NFTs on the blockchain.

## Features

- **ERC721 Certificate NFTs**: Issue verifiable educational certificates as non-fungible tokens
- **Off-chain Storage**: MongoDB for efficient querying and metadata management
- **Clean UI**: Minimal, grayscale design inspired by Apple, Linear, and Vercel
- **Web3 Integration**: Connect with MetaMask or other Web3 wallets
- **Authorized Issuers**: Role-based access control for certificate issuance

## Tech Stack

- **Frontend**: React (Create React App), Tailwind CSS (grayscale theme)
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Blockchain**: Solidity, Hardhat, OpenZeppelin
- **Web3**: ethers.js

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
```

#### Frontend (.env)

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CONTRACT_ADDRESS=your_contract_address_here
```

#### Contracts (.env)

Create `contracts/.env`:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
PRIVATE_KEY=your_private_key_here
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

### 5. Start MongoDB

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env
```

### 6. Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`.

### 7. Start Frontend

```bash
cd frontend
npm start
```

The frontend will open at `http://localhost:3000`.

## Usage

### For Issuers

1. Connect your wallet (must be an authorized issuer)
2. Navigate to "Issue Certificate" tab
3. Fill in certificate details:
   - Certificate ID (unique identifier)
   - Student wallet address
   - Student name
   - Course name
   - Institution
   - Token URI (metadata location)
4. Choose to mint NFT immediately or create off-chain first
5. Submit the form

### For Students

1. Connect your wallet
2. View all certificates associated with your wallet address
3. Certificates show:
   - Course information
   - Issue date
   - Token ID (if minted)
   - Transaction hash (if minted)
   - Status (pending/minted/failed)

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

- `mintCertificate()`: Mint a new certificate NFT
- `getCertificate()`: Retrieve certificate details by token ID
- `authorizeIssuer()`: Grant issuance permissions
- `revokeIssuer()`: Revoke issuance permissions
- `isAuthorizedIssuer()`: Check if address can issue certificates

## API Endpoints

### Certificates

- `GET /api/certificates` - Get all certificates (optional filters: `studentAddress`, `status`)
- `GET /api/certificates/:id` - Get specific certificate
- `POST /api/certificates` - Create new certificate
- `PATCH /api/certificates/:id/mint` - Mint NFT for existing certificate

### Students

- `GET /api/students` - Get all students
- `GET /api/students/:address` - Get student by wallet address
- `POST /api/students` - Create or update student

## Development Notes

- The frontend uses a strict grayscale theme (white and gray only)
- No animations or gradients by default
- Clean, minimal UI inspired by Apple, Linear, and Vercel
- All blockchain interactions require wallet connection
- Contract address must be set in environment variables

## Troubleshooting

### Contract not found
- Ensure contract is deployed and address is set in `.env` files
- Verify RPC URL is correct

### Wallet connection issues
- Install MetaMask browser extension
- Ensure you're on a supported network
- Check browser console for errors

### MongoDB connection errors
- Verify MongoDB is running
- Check `MONGODB_URI` in backend `.env`
- Ensure network access if using cloud MongoDB

### Frontend can't reach backend
- Verify backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend `.env`
- Ensure CORS is configured correctly

## License

MIT

## Contributing

This is a clean, production-ready setup. Focus on correctness, clarity, and scalability when extending the codebase.
