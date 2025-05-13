import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Alchemy } from 'alchemy-sdk';
import { CONFIG } from '../config';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [alchemy, setAlchemy] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalSupply, setTotalSupply] = useState(0);
  const [allTraits, setAllTraits] = useState({});

  // Initialize providers
  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      setAlchemy(new Alchemy(CONFIG.ALCHEMY_CONFIG));

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || '');
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this feature!');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await checkNetwork();
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const checkNetwork = async () => {
    if (!provider) return;

    try {
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(CONFIG.CHAIN_ID)) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${CONFIG.CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${CONFIG.CHAIN_ID.toString(16)}`,
                    chainName: CONFIG.CHAIN_NAME,
                    nativeCurrency: {
                      name: 'Ethereum',
                      symbol: CONFIG.CURRENCY_SYMBOL,
                      decimals: 18,
                    },
                    rpcUrls: [CONFIG.RPC_URL],
                    blockExplorerUrls: [CONFIG.BLOCK_EXPLORER_URL],
                  },
                ],
              });
            } catch {
              throw new Error('Failed to add Sepolia network to MetaMask');
            }
          } else {
            throw new Error('Failed to switch to Sepolia network');
          }
        }
      }
    } catch (error) {
      console.error('Network check error:', error);
      setError(error.message);
    }
  };

  const fetchCollectionData = useCallback(async () => {
    if (!alchemy) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get collection metadata
      const collectionMetadata = await alchemy.nft.getContractMetadata(CONFIG.COLLECTION_ADDRESS);
      const nfts = await alchemy.nft.getNftsForContract(CONFIG.COLLECTION_ADDRESS, {
        withMetadata: false,
        limit: 10000 // Adjust this based on your collection size
      });

      const transformedNFTs = nfts.nfts.map((nft) => {
        return {
          id: nft.tokenId,
          name: nft.name,
          image: nft.image.originalUrl,
          price: (nft.tokenId*0.05).toFixed(2),
          traits: nft.raw?.metadata?.attributes?.reduce((acc, attr) => ({
            ...acc,
            [attr.trait_type.toLowerCase()]: attr.value
          }), {}) || {},
          contract: {
            address: nft.contract.address,
            name: nft.contract.name,
            symbol: nft.contract.symbol,
            totalSupply: nft.contract.totalSupply
          }
        };
      });

      const traitsMap = {};
      transformedNFTs.forEach(nft => {
        Object.entries(nft.traits).forEach(([traitType, value]) => {
          if (!traitsMap[traitType]) traitsMap[traitType] = new Set();
          traitsMap[traitType].add(value);
        });
      });
      // Convert sets to arrays
      const allTraitsObj = {};
      Object.entries(traitsMap).forEach(([trait, values]) => {
        allTraitsObj[trait] = Array.from(values);
      });
      setAllTraits(allTraitsObj);

      setNfts(transformedNFTs);
      setTotalSupply(collectionMetadata.totalSupply || transformedNFTs.length);
    } catch (error) {
      console.error('Error fetching collection data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [alchemy, setNfts, setTotalSupply, setAllTraits, setIsLoading, setError]);

  // Fetch collection data on mount
  useEffect(() => {
    fetchCollectionData();
  }, [alchemy, fetchCollectionData]);

  const value = {
    account,
    provider,
    isConnecting,
    isLoading,
    error,
    nfts,
    totalSupply,
    allTraits,
    connectWallet,
    fetchCollectionData
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}; 