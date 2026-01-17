# EduChain API Documentation

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### POST /api/certificates/mint

Mint a new certificate NFT with IPFS metadata upload.

**Request Body:**
```json
{
  "certificateId": "CERT-2024-001",
  "studentAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "studentName": "John Doe",
  "courseName": "Blockchain Fundamentals",
  "institution": "University Name",
  "issueDate": "2024-01-17T00:00:00.000Z" // optional
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "certificate": {
    "_id": "...",
    "certificateId": "CERT-2024-001",
    "studentAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
    "studentName": "John Doe",
    "courseName": "Blockchain Fundamentals",
    "institution": "University Name",
    "tokenURI": "ipfs://QmXxxx...",
    "ipfsHash": "QmXxxx...",
    "tokenId": 1,
    "transactionHash": "0x...",
    "status": "minted",
    "issueDate": "2024-01-17T00:00:00.000Z",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "nft": {
    "tokenId": 1,
    "transactionHash": "0x...",
    "ipfsHash": "QmXxxx..."
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid address
- `500 Internal Server Error`: IPFS upload failed or blockchain minting failed

---

### GET /api/certificates/verify/:tokenId

Verify a certificate by its NFT token ID.

**Parameters:**
- `tokenId` (path): The NFT token ID to verify

**Response (200 OK):**
```json
{
  "isValid": true,
  "certificate": {
    "certificateId": "CERT-2024-001",
    "studentName": "John Doe",
    "courseName": "Blockchain Fundamentals",
    "institution": "University Name",
    "issueDate": "2024-01-17T00:00:00.000Z",
    "tokenId": 1,
    "transactionHash": "0x...",
    "ipfsHash": "QmXxxx..."
  },
  "blockchain": {
    "student": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
    "issueDate": "2024-01-17T00:00:00.000Z",
    "ipfsHash": "QmXxxx..."
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid token ID
- `404 Not Found`: Certificate not found
- `500 Internal Server Error`: Blockchain verification failed

---

### GET /api/certificates/:id

Get a specific certificate by ID (MongoDB _id, certificateId, or tokenId).

**Parameters:**
- `id` (path): Certificate ID (MongoDB _id, certificateId, or tokenId)

**Response (200 OK):**
```json
{
  "_id": "...",
  "certificateId": "CERT-2024-001",
  "studentAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "studentName": "John Doe",
  "courseName": "Blockchain Fundamentals",
  "institution": "University Name",
  "tokenURI": "ipfs://QmXxxx...",
  "ipfsHash": "QmXxxx...",
  "tokenId": 1,
  "transactionHash": "0x...",
  "status": "minted",
  "issueDate": "2024-01-17T00:00:00.000Z",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Error Responses:**
- `404 Not Found`: Certificate not found

---

### GET /api/certificates

Get all certificates with optional filters.

**Query Parameters:**
- `studentAddress` (optional): Filter by student wallet address
- `status` (optional): Filter by status (pending, minted, failed)
- `limit` (optional): Limit results (default: 100)

**Example:**
```
GET /api/certificates?studentAddress=0x742d35cc6634c0532925a3b844bc9e7595f0beb&status=minted&limit=50
```

**Response (200 OK):**
```json
[
  {
    "_id": "...",
    "certificateId": "CERT-2024-001",
    "studentAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
    "studentName": "John Doe",
    "courseName": "Blockchain Fundamentals",
    "institution": "University Name",
    "tokenURI": "ipfs://QmXxxx...",
    "ipfsHash": "QmXxxx...",
    "tokenId": 1,
    "transactionHash": "0x...",
    "status": "minted",
    "issueDate": "2024-01-17T00:00:00.000Z",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

## Environment Variables

Required environment variables in `backend/.env`:

```env
# Server
PORT=5000
MONGODB_URI=mongodb://localhost:27017/educhain
FRONTEND_URL=http://localhost:3000

# Blockchain
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=0x...

# IPFS/Pinata (choose one method)
PINATA_JWT=your_pinata_jwt_token
# OR
PINATA_API_KEY=your_api_key
PINATA_SECRET_KEY=your_secret_key
```

## Setup Pinata

1. Sign up at https://pinata.cloud
2. Get your JWT token from the API Keys section (recommended)
   - OR get API Key and Secret Key
3. Add to `.env` file

## Example Usage

### Mint a Certificate

```bash
curl -X POST http://localhost:5000/api/certificates/mint \
  -H "Content-Type: application/json" \
  -d '{
    "certificateId": "CERT-2024-001",
    "studentAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "studentName": "John Doe",
    "courseName": "Blockchain Fundamentals",
    "institution": "University Name"
  }'
```

### Verify a Certificate

```bash
curl http://localhost:5000/api/certificates/verify/1
```

### Get Certificate by ID

```bash
curl http://localhost:5000/api/certificates/CERT-2024-001
```

### Get All Certificates

```bash
curl http://localhost:5000/api/certificates?studentAddress=0x742d35cc6634c0532925a3b844bc9e7595f0beb
```
