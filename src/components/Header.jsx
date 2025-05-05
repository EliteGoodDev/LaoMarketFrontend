import { useState } from 'react';
import { ethers } from 'ethers';

const Header = () => {
  const [account, setAccount] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      
      if (!window.ethereum) {
        alert('Please install MetaMask to use this feature!');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <header className="w-full py-4 px-6 bg-gray-900 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">NFT Marketplace</h1>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 hover:scale-105 cursor-pointer"
        >
          {isConnecting ? 'Connecting...' : account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
        </button>
      </div>
    </header>
  );
};

export default Header; 