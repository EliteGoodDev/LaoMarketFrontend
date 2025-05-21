import { Network } from 'alchemy-sdk';

export const CONFIG = {
  COLLECTION_ADDRESS: '0xbdd324724ba03b76ed59d0d65a858247cf9a49f4',
  MARKETPLACE_CONTRACT_ADDRESS: '0x145af4d3b84cc79b1352d80786c7aed6b0b87a25',
  NETWORK: Network.ETH_SEPOLIA,
  CHAIN_ID: 11155111, // Sepolia chain ID
  CHAIN_NAME: 'Sepolia Testnet',
  CURRENCY_SYMBOL: 'ETH',
  BLOCK_EXPLORER_URL: 'https://sepolia.etherscan.io',
  ALCHEMY_CONFIG: {
    apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
    network: Network.ETH_SEPOLIA,
  },
  API_URL: import.meta.env.VITE_API_URL,
  MARKETPLACE_ABI: [
    "function listNFT(uint256 tokenId, uint256 price) external",
    "function updateListingPrice(uint256 tokenId, uint256 newPrice) external",
    "function cancelListing(uint256 tokenId) external",
    "function makeOffer(uint256 tokenId, uint256 expirationTime) external payable",
    "function cancelOffer(uint256 tokenId) external",
    "function buyNFT(uint256 tokenId) external payable",
    "function acceptOffer(uint256 tokenId, address offerer) external"
  ],
  COLLECTION_ABI: [
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function approve(address to, uint256 tokenId) external",
    "function getApproved(uint256 tokenId) external view returns (address)",
    "function setApprovalForAll(address operator, bool approved) external",
    "function isApprovedForAll(address owner, address operator) external view returns (bool)",
    "function transferFrom(address from, address to, uint256 tokenId) external",
    "function safeTransferFrom(address from, address to, uint256 tokenId) external"
  ]
    
}; 