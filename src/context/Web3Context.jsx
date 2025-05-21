import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Alchemy } from 'alchemy-sdk';
import { CONFIG } from '../config';
import axios from 'axios';

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
  const [marketplaceFee_origin, setMarketplaceFee_origin] = useState(0);
  const [creatorRoyalty_origin, setCreatorRoyalty_origin] = useState(0);

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

  const fetchMarketplaceFee = useCallback(async () => {
    if (!provider) return;
    const MARKETPLACE_FEE_ABI = ["function platformFee() view returns (uint256)"];
    const contract = new ethers.Contract(CONFIG.MARKETPLACE_CONTRACT_ADDRESS, MARKETPLACE_FEE_ABI, provider);
    const fee = await contract.platformFee();
    setMarketplaceFee_origin(parseInt(fee));
  }, [provider]);

  const fetchCreatorRoyalty = useCallback(async () => {
    if (!provider) return;
    const ROYALTY_PERCENTAGE_ABI = ["function royaltyPercentage() view returns (uint256)"];
    const contract = new ethers.Contract(CONFIG.COLLECTION_ADDRESS, ROYALTY_PERCENTAGE_ABI, provider);
    const royalty = await contract.royaltyPercentage();
    setCreatorRoyalty_origin(parseInt(royalty));
  }, [provider]);

  const fetchCollectionData = useCallback(async () => {
    if (!alchemy) return;

    try {
      setIsLoading(true);
      setError(null);

      const nfts = await alchemy.nft.getNftsForContract(CONFIG.COLLECTION_ADDRESS, {
        withMetadata: false,
        limit: 10000 // Adjust this based on your collection size
      });

      const listedNfts = (await axios.get(`${CONFIG.API_URL}/listnft`)).data;

      const transformedNFTs = nfts.nfts.map((nft) => {
        return {
          id: nft.tokenId,
          name: nft.name,
          image: nft.image.originalUrl,
          price: 0,
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
      listedNfts.forEach(nft => {
        const nftIndex = transformedNFTs.findIndex(t => t.id == nft.nft_id);
        if (nftIndex !== -1) {
          transformedNFTs[nftIndex].price = parseFloat(nft.nft_price);
        }
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
      setTotalSupply(transformedNFTs.length);
      
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

  useEffect(() => {
    fetchMarketplaceFee();
    fetchCreatorRoyalty();
  }, [fetchMarketplaceFee, fetchCreatorRoyalty]);

  const value = {
    account,
    provider,
    isConnecting,
    isLoading,
    error,
    nfts,
    setNfts,
    totalSupply,
    allTraits,
    connectWallet,
    fetchCollectionData,
    marketplaceFee_origin,
    creatorRoyalty_origin,
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