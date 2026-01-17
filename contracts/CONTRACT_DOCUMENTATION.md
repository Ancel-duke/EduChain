# CertificateNFT Smart Contract Documentation

## Overview

The `CertificateNFT` contract is an ERC721-compliant smart contract for issuing and managing academic certificates as non-fungible tokens (NFTs) on the blockchain. Each NFT represents one academic certificate with metadata stored on IPFS.

## Features

- ✅ **ERC721 Standard**: Fully compliant with ERC721 NFT standard
- ✅ **IPFS Integration**: Stores certificate metadata via IPFS hashes
- ✅ **Admin-Only Minting**: Only contract owner can mint certificates
- ✅ **Certificate Verification**: Public function to verify certificate authenticity
- ✅ **Non-Transferable**: Certificates cannot be transferred (prevents selling)
- ✅ **Security**: Uses ReentrancyGuard and input validation
- ✅ **OpenZeppelin**: Built on battle-tested OpenZeppelin libraries

## Contract Details

- **Name**: EduChain Academic Certificate
- **Symbol**: EDUCERT
- **Standard**: ERC721 with URI Storage extension
- **Access Control**: Ownable (only owner can mint)
- **Security**: ReentrancyGuard protection

## Functions

### `mintCertificate(address student, string ipfsHash)`

Mints a new certificate NFT to a student's address.

**Parameters:**
- `student`: Address of the student receiving the certificate
- `ipfsHash`: IPFS hash of the certificate metadata (e.g., "QmXxxx...")

**Returns:**
- `tokenId`: The ID of the newly minted token

**Requirements:**
- Only callable by contract owner (admin)
- Student address cannot be zero address
- IPFS hash cannot be empty

**Events:**
- Emits `CertificateMinted` with tokenId, student address, IPFS hash, and issue date

**Example:**
```solidity
uint256 tokenId = mintCertificate(
    0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb,
    "QmXxxx..."
);
```

### `verifyCertificate(uint256 tokenId)`

Verifies a certificate by token ID and returns its details.

**Parameters:**
- `tokenId`: The token ID to verify

**Returns:**
- `isValid`: True if the certificate is valid (exists and is not burned)
- `student`: Address of the student who owns the certificate
- `issueDate`: Timestamp when the certificate was issued
- `ipfsHash`: IPFS hash of the certificate metadata

**Example:**
```solidity
(bool isValid, address student, uint256 issueDate, string memory ipfsHash) = 
    verifyCertificate(1);
```

### `totalSupply()`

Returns the total number of certificates minted.

**Returns:**
- `uint256`: Total supply of certificates

### `getCertificateOwner(uint256 tokenId)`

Gets the owner of a certificate by token ID.

**Parameters:**
- `tokenId`: The token ID to query

**Returns:**
- `owner`: Address of the certificate owner

**Reverts:**
- If token does not exist

### `certificateIssueDate(uint256 tokenId)`

Public mapping to get the issue date of a certificate.

**Parameters:**
- `tokenId`: The token ID to query

**Returns:**
- `uint256`: Timestamp when the certificate was issued

### `certificateStudent(uint256 tokenId)`

Public mapping to get the student address of a certificate.

**Parameters:**
- `tokenId`: The token ID to query

**Returns:**
- `address`: Address of the student who received the certificate

## Events

### `CertificateMinted`
Emitted when a new certificate is minted.

```solidity
event CertificateMinted(
    uint256 indexed tokenId,
    address indexed student,
    string ipfsHash,
    uint256 issueDate
);
```

## Security Features

### 1. Access Control
- Only contract owner can mint certificates
- Uses OpenZeppelin's `Ownable` for secure access control

### 2. Reentrancy Protection
- Uses `ReentrancyGuard` to prevent reentrancy attacks
- Applied to the `mintCertificate` function

### 3. Input Validation
- Validates student address is not zero
- Validates IPFS hash is not empty
- Validates token exists before operations

### 4. Non-Transferable
- Certificates cannot be transferred or sold
- Only minting and burning are allowed
- Prevents certificate trading

## IPFS Integration

Certificates store metadata on IPFS using the standard format:
- **URI Format**: `ipfs://<hash>`
- **Example**: `ipfs://QmXxxx...`

The contract automatically prepends `ipfs://` to the provided hash when storing the token URI.

## Usage Example

### Deploying the Contract

```javascript
const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
const certificateNFT = await CertificateNFT.deploy(deployerAddress);
await certificateNFT.waitForDeployment();
```

### Minting a Certificate

```javascript
// Admin mints a certificate
const tx = await certificateNFT.mintCertificate(
    studentAddress,
    "QmXxxx..." // IPFS hash
);
const receipt = await tx.wait();
```

### Verifying a Certificate

```javascript
// Anyone can verify a certificate
const [isValid, student, issueDate, ipfsHash] = 
    await certificateNFT.verifyCertificate(tokenId);

console.log("Valid:", isValid);
console.log("Student:", student);
console.log("Issue Date:", new Date(issueDate * 1000));
console.log("IPFS Hash:", ipfsHash);
```

## Best Practices

1. **IPFS Metadata**: Store certificate metadata (student name, course, institution, etc.) as JSON on IPFS
2. **Hash Format**: Provide only the IPFS hash (without `ipfs://` prefix) - contract adds it automatically
3. **Verification**: Use `verifyCertificate` for public verification of certificate authenticity
4. **Events**: Listen to `CertificateMinted` events for off-chain indexing

## OpenZeppelin Libraries Used

- `ERC721`: Base NFT functionality
- `ERC721URIStorage`: Token URI storage extension
- `Ownable`: Access control
- `ReentrancyGuard`: Reentrancy protection

## License

MIT
