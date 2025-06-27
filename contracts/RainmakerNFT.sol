// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title RainmakerNFT
 * @dev NFT contract for Rainmaker Arena marketplace on Base blockchain
 * @author Rainmaker Arena Team
 */
contract RainmakerNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed to, string tokenURI, uint256 price);
    event NFTListed(uint256 indexed tokenId, uint256 price);
    event NFTUnlisted(uint256 indexed tokenId);
    event NFTSold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);
    event RoyaltyUpdated(uint256 indexed tokenId, address recipient, uint96 feeNumerator);
    
    // Structs
    struct NFTListing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isListed;
        uint256 listedAt;
    }
    
    struct NFTMetadata {
        string name;
        string description;
        string category;
        string rarity;
        address creator;
        uint256 createdAt;
    }
    
    // State variables
    mapping(uint256 => NFTListing) public listings;
    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(address => uint256[]) public userNFTs;
    mapping(string => bool) public categoryExists;
    mapping(string => bool) public rarityExists;
    
    uint256 public marketplaceFee = 250; // 2.5% (250/10000)
    uint256 public constant MAX_ROYALTY = 1000; // 10% max royalty
    uint256 public totalVolume;
    uint256 public totalSales;
    
    string[] public categories;
    string[] public rarities;
    
    constructor() ERC721("Rainmaker Arena NFT", "RAIN") {
        // Initialize categories
        categories.push("Art");
        categories.push("Gaming");
        categories.push("Collectibles");
        categories.push("Utility");
        categories.push("Music");
        categoryExists["Art"] = true;
        categoryExists["Gaming"] = true;
        categoryExists["Collectibles"] = true;
        categoryExists["Utility"] = true;
        categoryExists["Music"] = true;
        
        // Initialize rarities
        rarities.push("Common");
        rarities.push("Uncommon");
        rarities.push("Rare");
        rarities.push("Epic");
        rarities.push("Legendary");
        rarityExists["Common"] = true;
        rarityExists["Uncommon"] = true;
        rarityExists["Rare"] = true;
        rarityExists["Epic"] = true;
        rarityExists["Legendary"] = true;
    }
    
    /**
     * @dev Mint a new NFT
     * @param to The address to mint the NFT to
     * @param tokenURI The URI for the token metadata
     * @param name The name of the NFT
     * @param description The description of the NFT
     * @param category The category of the NFT
     * @param rarity The rarity of the NFT
     * @param price The initial listing price (0 if not listing immediately)
     */
    function mintNFT(
        address to,
        string memory tokenURI,
        string memory name,
        string memory description,
        string memory category,
        string memory rarity,
        uint256 price
    ) external returns (uint256) {
        require(categoryExists[category], "Invalid category");
        require(rarityExists[rarity], "Invalid rarity");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Store metadata
        nftMetadata[tokenId] = NFTMetadata({
            name: name,
            description: description,
            category: category,
            rarity: rarity,
            creator: msg.sender,
            createdAt: block.timestamp
        });
        
        // Add to user's NFTs
        userNFTs[to].push(tokenId);
        
        emit NFTMinted(tokenId, to, tokenURI, price);
        
        // List immediately if price is set
        if (price > 0) {
            _listNFT(tokenId, price);
        }
        
        return tokenId;
    }
    
    /**
     * @dev List an NFT for sale
     * @param tokenId The token ID to list
     * @param price The listing price
     */
    function listNFT(uint256 tokenId, uint256 price) external {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].isListed, "Already listed");
        
        _listNFT(tokenId, price);
    }
    
    /**
     * @dev Internal function to list an NFT
     * @param tokenId The token ID to list
     * @param price The listing price
     */
    function _listNFT(uint256 tokenId, uint256 price) internal {
        listings[tokenId] = NFTListing({
            tokenId: tokenId,
            seller: ownerOf(tokenId),
            price: price,
            isListed: true,
            listedAt: block.timestamp
        });
        
        emit NFTListed(tokenId, price);
    }
    
    /**
     * @dev Unlist an NFT from sale
     * @param tokenId The token ID to unlist
     */
    function unlistNFT(uint256 tokenId) external {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(listings[tokenId].isListed, "Not listed");
        
        listings[tokenId].isListed = false;
        emit NFTUnlisted(tokenId);
    }
    
    /**
     * @dev Buy an NFT
     * @param tokenId The token ID to buy
     */
    function buyNFT(uint256 tokenId) external payable nonReentrant {
        require(_exists(tokenId), "Token does not exist");
        
        NFTListing storage listing = listings[tokenId];
        require(listing.isListed, "Not for sale");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy your own NFT");
        
        address seller = listing.seller;
        uint256 price = listing.price;
        
        // Calculate fees
        uint256 fee = (price * marketplaceFee) / 10000;
        uint256 sellerAmount = price - fee;
        
        // Update listing
        listing.isListed = false;
        
        // Remove from seller's NFTs and add to buyer's NFTs
        _removeFromUserNFTs(seller, tokenId);
        userNFTs[msg.sender].push(tokenId);
        
        // Transfer ownership
        _transfer(seller, msg.sender, tokenId);
        
        // Transfer payments
        (bool success1, ) = payable(seller).call{value: sellerAmount}("");
        require(success1, "Payment to seller failed");
        
        // Keep marketplace fee in contract
        
        // Refund excess payment
        if (msg.value > price) {
            (bool success2, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(success2, "Refund failed");
        }
        
        // Update statistics
        totalVolume += price;
        totalSales++;
        
        emit NFTSold(tokenId, seller, msg.sender, price);
    }
    
    /**
     * @dev Remove token from user's NFT array
     * @param user The user address
     * @param tokenId The token ID to remove
     */
    function _removeFromUserNFTs(address user, uint256 tokenId) internal {
        uint256[] storage userTokens = userNFTs[user];
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (userTokens[i] == tokenId) {
                userTokens[i] = userTokens[userTokens.length - 1];
                userTokens.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Get all NFTs owned by a user
     * @param user The user address
     */
    function getUserNFTs(address user) external view returns (uint256[] memory) {
        return userNFTs[user];
    }
    
    /**
     * @dev Get NFT metadata
     * @param tokenId The token ID
     */
    function getNFTMetadata(uint256 tokenId) external view returns (NFTMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return nftMetadata[tokenId];
    }
    
    /**
     * @dev Get all listed NFTs
     */
    function getListedNFTs() external view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIdCounter.current();
        uint256[] memory listed = new uint256[](totalSupply);
        uint256 listedCount = 0;
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (listings[i].isListed) {
                listed[listedCount] = i;
                listedCount++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](listedCount);
        for (uint256 i = 0; i < listedCount; i++) {
            result[i] = listed[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get NFTs by category
     * @param category The category to filter by
     */
    function getNFTsByCategory(string memory category) external view returns (uint256[] memory) {
        require(categoryExists[category], "Invalid category");
        
        uint256 totalSupply = _tokenIdCounter.current();
        uint256[] memory categoryNFTs = new uint256[](totalSupply);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (keccak256(bytes(nftMetadata[i].category)) == keccak256(bytes(category))) {
                categoryNFTs[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = categoryNFTs[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get NFTs by rarity
     * @param rarity The rarity to filter by
     */
    function getNFTsByRarity(string memory rarity) external view returns (uint256[] memory) {
        require(rarityExists[rarity], "Invalid rarity");
        
        uint256 totalSupply = _tokenIdCounter.current();
        uint256[] memory rarityNFTs = new uint256[](totalSupply);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (keccak256(bytes(nftMetadata[i].rarity)) == keccak256(bytes(rarity))) {
                rarityNFTs[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = rarityNFTs[i];
        }
        
        return result;
    }
    
    /**
     * @dev Add new category
     * @param category The new category to add
     */
    function addCategory(string memory category) external onlyOwner {
        require(!categoryExists[category], "Category already exists");
        categories.push(category);
        categoryExists[category] = true;
    }
    
    /**
     * @dev Add new rarity
     * @param rarity The new rarity to add
     */
    function addRarity(string memory rarity) external onlyOwner {
        require(!rarityExists[rarity], "Rarity already exists");
        rarities.push(rarity);
        rarityExists[rarity] = true;
    }
    
    /**
     * @dev Get all categories
     */
    function getCategories() external view returns (string[] memory) {
        return categories;
    }
    
    /**
     * @dev Get all rarities
     */
    function getRarities() external view returns (string[] memory) {
        return rarities;
    }
    
    /**
     * @dev Update marketplace fee (only owner)
     * @param newFee The new fee in basis points
     */
    function updateMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        marketplaceFee = newFee;
    }
    
    /**
     * @dev Withdraw marketplace fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Get marketplace statistics
     */
    function getMarketplaceStats() external view returns (
        uint256 totalNFTs,
        uint256 listedNFTs,
        uint256 _totalVolume,
        uint256 _totalSales,
        uint256 avgPrice
    ) {
        totalNFTs = _tokenIdCounter.current();
        
        uint256 listed = 0;
        for (uint256 i = 1; i <= totalNFTs; i++) {
            if (listings[i].isListed) {
                listed++;
            }
        }
        listedNFTs = listed;
        
        _totalVolume = totalVolume;
        _totalSales = totalSales;
        avgPrice = totalSales > 0 ? totalVolume / totalSales : 0;
    }
    
    // Required overrides
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 