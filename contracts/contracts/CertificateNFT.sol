// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CertificateNFT
 * @dev ERC721 token representing academic certificates
 * @notice This contract allows only the admin (owner) to mint certificate NFTs
 * Each NFT represents one academic certificate with IPFS metadata storage
 */
contract CertificateNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    // Token ID counter
    uint256 private _tokenIds;

    // Mapping from token ID to certificate issue date
    mapping(uint256 => uint256) public certificateIssueDate;

    // Mapping from token ID to student address (for verification)
    mapping(uint256 => address) public certificateStudent;

    // Event emitted when a certificate is minted
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed student,
        string ipfsHash,
        uint256 issueDate
    );

    // Event emitted when a certificate is minted (simplified version)
    event MintedCertificate(
        uint256 indexed tokenId,
        address indexed student,
        string ipfsHash
    );

    // Event emitted when a certificate is verified
    event CertificateVerified(
        uint256 indexed tokenId,
        address indexed student,
        bool isValid
    );

    /**
     * @dev Constructor sets the contract owner
     * @param initialOwner Address that will own the contract and can mint certificates
     */
    constructor(address initialOwner) 
        ERC721("EduChain Academic Certificate", "EDUCERT") 
        Ownable(initialOwner) 
    {
        // Owner is set via Ownable constructor
    }

    /**
     * @dev Mint a new certificate NFT
     * @param student Address of the student receiving the certificate
     * @param ipfsHash IPFS hash of the certificate metadata (e.g., "QmXxxx...")
     * @return tokenId The ID of the newly minted token
     * 
     * Requirements:
     * - Only the contract owner (admin) can call this function
     * - Student address must not be zero address
     * - IPFS hash must not be empty
     * 
     * Security:
     * - Uses ReentrancyGuard to prevent reentrancy attacks
     * - Validates input parameters
     */
    function mintCertificate(
        address student,
        string memory ipfsHash
    ) 
        external 
        onlyOwner 
        nonReentrant 
        returns (uint256) 
    {
        // Validate student address - must not be zero address
        require(student != address(0), "CertificateNFT: Student address cannot be zero");
        
        // Validate IPFS hash - must not be empty
        require(bytes(ipfsHash).length > 0, "CertificateNFT: IPFS hash cannot be empty");
        
        // Additional validation: IPFS hash should have minimum reasonable length
        // IPFS hashes are typically 46 characters (CIDv0) or longer (CIDv1)
        require(bytes(ipfsHash).length >= 10, "CertificateNFT: IPFS hash too short");

        // Increment token ID
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        // Construct IPFS URI (standard format: ipfs://<hash>)
        string memory tokenURI = string(abi.encodePacked("ipfs://", ipfsHash));

        // Mint the NFT to the student
        _mint(student, newTokenId);
        
        // Set the token URI (IPFS hash)
        _setTokenURI(newTokenId, tokenURI);

        // Store certificate metadata
        certificateIssueDate[newTokenId] = block.timestamp;
        certificateStudent[newTokenId] = student;

        // Emit events
        emit CertificateMinted(newTokenId, student, ipfsHash, block.timestamp);
        emit MintedCertificate(newTokenId, student, ipfsHash);

        return newTokenId;
    }

    /**
     * @dev Verify a certificate by token ID
     * @param tokenId The token ID to verify
     * @return isValid True if the certificate is valid (exists and is not burned)
     * @return student Address of the student who owns the certificate
     * @return issueDate Timestamp when the certificate was issued
     * @return ipfsHash IPFS hash of the certificate metadata
     * 
     * Verification checks:
     * - Token exists (not burned)
     * - Token has an owner
     * - Certificate metadata is stored
     */
    function verifyCertificate(uint256 tokenId) 
        external 
        view 
        returns (
            bool isValid,
            address student,
            uint256 issueDate,
            string memory ipfsHash
        ) 
    {
        // Check if token exists
        if (_ownerOf(tokenId) == address(0)) {
            return (false, address(0), 0, "");
        }

        // Get certificate data
        student = certificateStudent[tokenId];
        issueDate = certificateIssueDate[tokenId];
        
        // Get IPFS hash from token URI
        string memory fullURI = tokenURI(tokenId);
        // Extract IPFS hash (remove "ipfs://" prefix if present)
        if (bytes(fullURI).length > 7 && 
            keccak256(bytes(substring(fullURI, 0, 7))) == keccak256(bytes("ipfs://"))) {
            ipfsHash = substring(fullURI, 7, bytes(fullURI).length);
        } else {
            ipfsHash = fullURI;
        }

        // Certificate is valid if it has an owner and issue date
        isValid = (student != address(0) && issueDate > 0);
    }

    /**
     * @dev Get total number of certificates minted
     * @return Total supply of certificates
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    /**
     * @dev Get certificate owner by token ID
     * @param tokenId The token ID to query
     * @return owner Address of the certificate owner
     */
    function getCertificateOwner(uint256 tokenId) external view returns (address owner) {
        require(_ownerOf(tokenId) != address(0), "CertificateNFT: Token does not exist");
        return ownerOf(tokenId);
    }

    /**
     * @dev Internal helper function to extract substring
     * @param str String to extract from
     * @param start Start index
     * @param end End index
     * @return Extracted substring
     */
    function substring(string memory str, uint256 start, uint256 end) 
        internal 
        pure 
        returns (string memory) 
    {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = strBytes[i];
        }
        return string(result);
    }

    /**
     * @dev Override to prevent transfers (certificates are non-transferable)
     * This ensures certificates cannot be sold or transferred
     * Only minting (from address(0)) and burning (to address(0)) are allowed
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from is address(0)) and burning (to is address(0))
        // But prevent transfers (both from and to are non-zero addresses)
        if (from != address(0) && to != address(0)) {
            revert("CertificateNFT: Certificates are non-transferable");
        }
        
        return super._update(to, tokenId, auth);
    }
}
