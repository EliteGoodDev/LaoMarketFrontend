import { Network } from 'alchemy-sdk';

export const CONFIG = {
  COLLECTION_ADDRESS: '0xbdd324724ba03b76ed59d0d65a858247cf9a49f4',
  MARKETPLACE_CONTRACT_ADDRESS: '0xb1becd22581a7e1af444073228153c200af35387',
  NETWORK: Network.ETH_SEPOLIA,
  CHAIN_ID: 11155111, // Sepolia chain ID
  CHAIN_NAME: 'Sepolia Testnet',
  CURRENCY_SYMBOL: 'ETH',
  BLOCK_EXPLORER_URL: 'https://sepolia.etherscan.io',
  ALCHEMY_CONFIG: {
    apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
    network: Network.ETH_SEPOLIA,
  },
  API_URL: 'http://localhost:3000/api'
}; 