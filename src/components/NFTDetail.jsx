import { useNavigate, useParams } from 'react-router-dom';
import { useWeb3 } from '../context/useWeb3';
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { CONFIG } from '../config';

const NFTDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedNft, setSelectedNft] = useState(null);
  const [isNftOwner, setIsNftOwner] = useState(false);
  const [nftListed, setNftListed] = useState(false);
  const [offers, setOffers] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const { account, marketplaceFee_origin, creatorRoyalty_origin, nfts, connectWallet, setNfts } = useWeb3();
  const [madeOffer, setMadeOffer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("list");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    if (!account) {
      connectWallet();
    }
    setMadeOffer(false);
    if (offers.length > 0) {
      offers.forEach(offer => {
        if (offer.nft_offer_address.toLowerCase() == account.toLowerCase()) {
          setMadeOffer(true);
        }
      });
    }
  }, [offers, account, connectWallet]);

  useEffect(() => {
    async function fetchNftData() {
        setIsInitializing(true);
        nfts.forEach(nft => {
          if (nft.id == id) {
          setSelectedNft(nft);
        }
      });
      setNftListed(selectedNft && selectedNft.price == 0 ? false: true);
      setIsNftOwner(false);
      if (selectedNft) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONFIG.COLLECTION_ADDRESS, CONFIG.COLLECTION_ABI, signer);
        const owner = await contract.ownerOf(selectedNft.id);
        if (owner.toLowerCase() == account.toLowerCase()) {
          setIsNftOwner(true);
        }
      }
      if(selectedNft){
        const offers = await axios.get(`${CONFIG.API_URL}/offers/nft/${selectedNft.id}`).then(res => res.data);
        setOffers(offers);
      }
      else{
        setOffers([]);
        setMadeOffer(false);
      }
      setIsInitializing(false);
    }
    fetchNftData();
  }, [id, nfts, account, selectedNft]);

  if (!selectedNft) {
    return <div>NFT not found</div>;
  }

  const getMarketplaceContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(
      CONFIG.MARKETPLACE_CONTRACT_ADDRESS,
      CONFIG.MARKETPLACE_ABI,
      signer
    );
  };

  const getCollectionContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(
      CONFIG.COLLECTION_ADDRESS,
      CONFIG.COLLECTION_ABI,
      signer
    );
  };

  const handleAcceptOffer = async (offer) => {
    try{
      setIsLoading(true);
      const collectionContract = await getCollectionContract();
      const marketplaceContract = await getMarketplaceContract();
      const approvedAddress = await collectionContract.getApproved(selectedNft.id);
      if(approvedAddress.toLowerCase() != CONFIG.MARKETPLACE_CONTRACT_ADDRESS.toLowerCase()){
        const approveTx = await collectionContract.approve(
          CONFIG.MARKETPLACE_CONTRACT_ADDRESS, 
          selectedNft.id
        );
        await approveTx.wait();
        console.log('NFT approved successfully');
      }
      const acceptTx = await marketplaceContract.acceptOffer(selectedNft.id, offer.nft_offer_address);
      await acceptTx.wait();
      console.log('NFT offer accepted successfully');
    if(nftListed){
      axios.delete(`${CONFIG.API_URL}/listnft/${selectedNft.id}`);
      const newnfts = nfts.map(nft => {
        if(nft.id == selectedNft.id){
          return {
            ...nft,
            price: 0
          }
        }
        return nft;
      })
      setNfts(newnfts);
    }
      const data = {
        offererAddress: offer.nft_offer_address,
        nftId: selectedNft.id
      }
      axios.delete(`${CONFIG.API_URL}/offers`, {
        data: data
      });
      const newoffers = offers.filter(originaloffer => originaloffer.nft_offer_address != offer.nft_offer_address);
      setOffers(newoffers);
      setIsLoading(false);
      setModalMessage('NFT offer accepted successfully');
      setIsModalOpen(false);
      setShowSuccessModal(true);
    }catch(error){
      console.error('Error accept offer NFT:', error);
      setIsLoading(false);
      setModalMessage('Failed to accept offer NFT. Please try again.');
      setShowFailModal(true);
    }
  }

  const handleBuyNow = async () => {
    try{
      setIsLoading(true);
      const marketplaceContract = await getMarketplaceContract();
      const buyTx = await marketplaceContract.buyNFT(selectedNft.id, {value: ethers.parseEther(selectedNft.price.toString())});
      await buyTx.wait();
      console.log('NFT bought successfully');
      axios.delete(`${CONFIG.API_URL}/listnft/${selectedNft.id}`);
      const newnfts = nfts.map(nft => {
        if(nft.id == selectedNft.id){
          return {
            ...nft,
            price: 0
          }
        }
        return nft;
      })
      setNfts(newnfts);
      if(madeOffer){
        const data = {
          offererAddress: account,
          nftId: selectedNft.id
        }
        axios.delete(`${CONFIG.API_URL}/offers`, {
          data: data
        });
        const newoffers = offers.filter(offer => offer.nft_offer_address != account);
        setOffers(newoffers);
      }
      setIsLoading(false);
      setModalMessage('NFT bought successfully');
      setIsModalOpen(false);
      setShowSuccessModal(true);
    }catch(error){
      console.error('Error buy NFT:', error);
      setIsLoading(false);
      setModalMessage('Failed to buy NFT. Please try again.');
      setShowFailModal(true);
    }
  }

  const handleUnlistNft = async () => {
    try{
      setIsLoading(true);
      const marketplaceContract = await getMarketplaceContract();
      const unlistTx = await marketplaceContract.cancelListing(selectedNft.id);
      await unlistTx.wait();
      console.log('NFT unlisted successfully');
      await axios.delete(`${CONFIG.API_URL}/listnft/${selectedNft.id}`)
      const newnfts = nfts.map(nft => {
        if(nft.id == selectedNft.id){
          return {
            ...nft,
            price: 0
          }
        }
        return nft;
      })
      setNfts(newnfts);
      setIsLoading(false);
      setModalMessage('NFT unlisted successfully');
      setShowSuccessModal(true);
    }catch(error){
      console.error('Error unlisting NFT:', error);
      setIsLoading(false);
      setModalMessage('Failed to unlist NFT. Please try again.');
      setShowFailModal(true);
    }
  }

  const handleCancelOffer = async () => {

    try{
      setIsLoading(true);
      const marketplaceContract = await getMarketplaceContract();
      const offerTx = await marketplaceContract.cancelOffer(selectedNft.id);
      await offerTx.wait();
      console.log('NFT offer canceled successfully');
      const data = {
        offererAddress: account,
        nftId: selectedNft.id
      }
    
    axios.delete(`${CONFIG.API_URL}/offers`, {
      data: data
    })
    const newoffers = offers.filter(offer => offer.nft_offer_address != account);
    setOffers(newoffers);
    setIsLoading(false);
    setModalMessage('Offer canceled successfully');
    setIsModalOpen(false);
    setShowSuccessModal(true);
    }catch(error){
      console.error('Error cancel offer NFT:', error);
      setIsLoading(false);
      setModalMessage('Failed to cancel offer NFT. Please try again.');
      setShowFailModal(true);
    }
  }

  // Add this JSX right before the closing div of the container
  const Modal = () => {
    const [listPrice, setListPrice] = useState(0);
    const [fees, setFees] = useState({});
    const [offerExpiration, setOfferExpiration] = useState(0);

    const handlePriceChange = useCallback((e) => {
      setListPrice(parseFloat(e.target.value));
    }, [setListPrice]);
    // Add this function to calculate fees
  const calculateFees = (price) => {
    // Convert to wei for precise calculations
    const priceInWei = ethers.parseEther(price.toString());
    const marketplaceFeeInWei = (priceInWei * BigInt(marketplaceFee_origin)) / BigInt(10000);
    const creatorRoyaltyInWei = (priceInWei * BigInt(creatorRoyalty_origin)) / BigInt(10000);
    const totalFeesInWei = marketplaceFeeInWei + creatorRoyaltyInWei;
    const youReceiveInWei = priceInWei - totalFeesInWei;

    return {
      marketplaceFee: Number(ethers.formatEther(marketplaceFeeInWei)),
      creatorRoyalty: Number(ethers.formatEther(creatorRoyaltyInWei)),
      totalFees: Number(ethers.formatEther(totalFeesInWei)),
      youReceive: Number(ethers.formatEther(youReceiveInWei))
    };
  };

  useEffect(() => {
    setFees(calculateFees(parseFloat(listPrice) || 0));
  }, [listPrice]);

  useEffect(() => {
    setOfferExpiration(Math.floor(Date.now()/1000) + 30 * 24 * 60 * 60);
  }, []);

  // Add this function to handle listing
  const handleListNFT = async () => {
    if (listPrice <= 0) {
      alert("Please enter a valid price");
      return;
    }

    try {
      setIsLoading(true);
      const collectionContract = await getCollectionContract();
      const marketplaceContract = await getMarketplaceContract();

      // First approve the marketplace contract
      const approvedAddress = await collectionContract.getApproved(selectedNft.id);
        if(approvedAddress.toLowerCase() != CONFIG.MARKETPLACE_CONTRACT_ADDRESS.toLowerCase()){
          const approveTx = await collectionContract.approve(
            CONFIG.MARKETPLACE_CONTRACT_ADDRESS, 
            selectedNft.id
          );
        await approveTx.wait();
        console.log('NFT approved successfully');
      }

      // Then list the NFT
      const listTx = await marketplaceContract.listNFT(
        selectedNft.id, 
        ethers.parseEther(listPrice.toString())
      );
      await listTx.wait();
      console.log('NFT listed successfully');

      // After successful blockchain transaction, update backend
      const data = {
        listerAddress: account,
        nftId: selectedNft.id,
        price: listPrice
      }
      await axios.post(`${CONFIG.API_URL}/listnft`, data);
      const newnfts = nfts.map(nft => {
        if(nft.id == selectedNft.id){
          return {
            ...nft,
            price: listPrice
          }
        }
        return nft;
      })
      setNfts(newnfts);
      setIsLoading(false);
      setModalMessage('NFT listed successfully');
      setIsModalOpen(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error in listing process:', error);
      setIsLoading(false);
      setModalMessage('Failed to list NFT. Please try again.');
      setShowFailModal(true);
    }
  };

  const handleMakeOffer = async () => {
    if (listPrice <= 0) {
      alert("Please enter a valid price");
      return;
    }

    try {
      setIsLoading(true);
      const marketplaceContract = await getMarketplaceContract();
      const offerTx = await marketplaceContract.makeOffer(
        selectedNft.id,
        offerExpiration,
        { value: ethers.parseEther(listPrice.toString()) }  // Send ETH with the transaction
      );
      await offerTx.wait();
      
      const data = {
        offererAddress: account,
        nftId: selectedNft.id,
        price: listPrice,
        expireTimestamp: offerExpiration
      }
      await axios.post(`${CONFIG.API_URL}/offers`, data);
      
      setOffers([...offers, {nft_offer_address: account, offer_price: listPrice, expirationTime: offerExpiration}]);
      setIsLoading(false);
      setModalMessage('Offer made successfully');
      setIsModalOpen(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error in offering process:', error);
      setIsLoading(false);
      setModalMessage('Failed to make offer. Please try again.');
      setShowFailModal(true);
    }
  }

  const handleEditListing = async () => {
    if (listPrice <= 0) {
      alert("Please enter a valid price");
      return;
    }

    try {
      setIsLoading(true);
      const collectionContract = await getCollectionContract();
      const marketplaceContract = await getMarketplaceContract();

      // First approve the marketplace contract
      const approvedAddress = await collectionContract.getApproved(selectedNft.id);
        if(approvedAddress.toLowerCase() != CONFIG.MARKETPLACE_CONTRACT_ADDRESS.toLowerCase()){
          const approveTx = await collectionContract.approve(
            CONFIG.MARKETPLACE_CONTRACT_ADDRESS, 
            selectedNft.id
          );
        await approveTx.wait();
        console.log('NFT approved successfully');
      }

      // Then list the NFT
      const listTx = await marketplaceContract.updateListingPrice(
        selectedNft.id, 
        ethers.parseEther(listPrice.toString())
      );
      await listTx.wait();
      console.log('NFT listed successfully');

      const data = {
        nftId: selectedNft.id,
        price: listPrice
      }
      await axios.put(`${CONFIG.API_URL}/listnft`, data);
      const newnfts = nfts.map(nft => {
        if(nft.id == selectedNft.id){
          return {
            ...nft,
            price: listPrice
          }
        }
        return nft;
      })
      setNfts(newnfts);
      setIsLoading(false);
      setModalMessage('NFT Edited successfully');
      setIsModalOpen(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error in listing process:', error);
      setIsLoading(false);
      setModalMessage('Failed to edit NFT. Please try again.');
      setShowFailModal(true);
    }
      
  }

  const handleEditOffer = async () => {
    if (listPrice <= 0) {
      alert("Please enter a valid price");
      return;
    }
    try {
      setIsLoading(true);
      const marketplaceContract = await getMarketplaceContract();
      const offerTx = await marketplaceContract.makeOffer(
        selectedNft.id,
        offerExpiration,
        { value: ethers.parseEther(listPrice.toString()) }  // Send ETH with the transaction
      );
      await offerTx.wait();
    const data = {
      offererAddress: account,
      nftId: selectedNft.id,
      price: listPrice,
      expireTimestamp: offerExpiration
    }
      axios.put(`${CONFIG.API_URL}/offers`, data)
      const newoffers = offers.map(offer => {
        if(offer.nft_offer_address == account){
          return {
            ...offer,
            offer_price: listPrice,
            expirationTime: offerExpiration
          }
        }
        return offer;
      })
      setOffers(newoffers);
      setIsLoading(false);
      setModalMessage('Offer edited successfully');
      setIsModalOpen(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error in offering process:', error);
      setIsLoading(false);
      setModalMessage('Failed to edit offer. Please try again.');
      setShowFailModal(true);
    }
  }

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">{modalType == "list" ? "List NFT for Sale" : modalType == "makeOffer" ? "Make Offer" : modalType == "editListing" ? "Edit Listing" : "Update Offer"}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price (ETH)
              </label>
              <input
                type="number"
                value={listPrice}
                onChange={handlePriceChange}
                maxLength={10}
                className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter price in ETH"
                min="0"
              />
            </div>
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{modalType == "list" || modalType == "editListing" ? "Listing Price" : "Offer Price"}</span>
                <span className="text-white">{listPrice || 0} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Marketplace Fee ({marketplaceFee_origin/100}%)</span>
                <span className="text-white">{fees.marketplaceFee} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Creator Royalty ({creatorRoyalty_origin/100}%)</span>
                <span className="text-white">{fees.creatorRoyalty} ETH</span>
              </div>
              <div className="border-t border-white/10 pt-3 mt-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-300">{modalType == "list" || modalType == "editListing" ? "You will receive" : "The NFT owner will receive"}</span>
                  <span className="text-pink-500">{fees.youReceive} ETH</span>
                </div>
              </div>
              {(modalType == "makeOffer" || modalType == "editOffer") && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Expiration Time (30 days)</span>
                  <span className="text-white">
                    {offerExpiration ? 
                      new Date(offerExpiration * 1000).toLocaleString() 
                      : 'Not set'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all duration-300 hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={modalType == "list" ? handleListNFT : modalType == "editListing" ? handleEditListing : modalType == "makeOffer" ? handleMakeOffer : handleEditOffer}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:cursor-pointer"
              >
                {modalType == "list" ? "List NFT" : modalType == "editListing" ? "Edit Listing" : modalType == "makeOffer" ? "Make Offer" : "Update Offer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-white">Processing Transaction</h2>
        <p className="text-gray-400 mt-2">Please wait while we process your transaction...</p>
      </div>
    </div>
  );

  const InitializingModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-white">Loading...</h2>
        <p className="text-gray-400 mt-2">Please wait while we load the NFT...</p>
      </div>
    </div>
  );

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Success!</h2>
        <p className="text-gray-400">{modalMessage}</p>
        <button
          onClick={() => {
            setShowSuccessModal(false);
          }}
          className="mt-6 w-full py-3 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:cursor-pointer"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const FailModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Error</h2>
        <p className="text-gray-400">{modalMessage}</p>
        <button
          onClick={() => setShowFailModal(false)}
          className="mt-6 w-full py-3 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors hover:scale-105 hover:shadow-lg duration-300 hover:cursor-pointer"
      >
        ← Back
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-2xl overflow-hidden my-auto">
          <img
            src={selectedNft.image}
            alt={selectedNft.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white">{selectedNft.name}</h1>
          
          <div className="bg-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Traits</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(selectedNft.traits).map(([trait, value]) => (
                <div key={trait} className="bg-white/5 rounded-lg p-3">
                  <p className="text-sm text-gray-400">{trait}</p>
                  <p className="text-lg font-medium text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-6">
            {nftListed ?
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">Price</h2>
              <p className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                {selectedNft.price} ETH
              </p>
            </div>
            :
            <div>
            <h2 className="text-xl font-semibold mb-4 text-white">Not Listed</h2>
            </div>
            }
            <div className="flex justify-center gap-8">
            {isNftOwner ? 
              (
                nftListed ? 
                (
                  <>
                    <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer"
                    onClick={() => {setModalType("editListing"); setIsModalOpen(true)}}
                    >
                      Edit Listing
                    </button>
                    <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer"
                      onClick={() => {handleUnlistNft()}}
                    >
                      Unlist NFT
                    </button>
                  </>
                )
                :
                (
                  <button 
                    className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer"
                    onClick={() => {setModalType("list"); setIsModalOpen(true)}}
                  >
                    List NFT
                  </button>
                )
              ) 
              : 
              (
                
                nftListed && madeOffer ?
                <>
                  <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer"
                  onClick={() => {handleBuyNow()}}
                  >
                    Buy Now
                  </button>
                  <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer"
                  onClick={() => {setModalType("editOffer"); setIsModalOpen(true)}}
                  >
                    Update Offer
                  </button>
                  <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer"
                  onClick={() => {handleCancelOffer()}}
                  >
                    Cancel Offer
                  </button>
                </>
                  :
                !nftListed && madeOffer ?
                <>
                  <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer"
                  onClick={() => {setModalType("editOffer"); setIsModalOpen(true)}}
                  >
                    Update Offer
                  </button>
                  <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer"
                  onClick={() => {handleCancelOffer()}}
                  >
                    Cancel Offer
                  </button>
                </>
                :
                nftListed && !madeOffer ?
                <>
                  <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer"
                  onClick={() => {handleBuyNow()}}
                  >
                    Buy Now
                  </button>
                  <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer"
                  onClick={() => {setModalType("makeOffer"); setIsModalOpen(true)}}
                  >
                    Make Offer
                  </button>
                </>
                :
                <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer"
                  onClick={() => {setModalType("makeOffer"); setIsModalOpen(true)}}
                >
                  Make Offer
                </button>
              )
            }
          </div>
          </div>
        </div>
      </div>
      {/* Offers Table */}
      {offers.length > 0 && (
      <div className="mt-8">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Offer Address
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Expiration Time
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {offers.map((offer, index) => (
                <tr key={index} className="hover:bg-white/5 transition-colors duration-300">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                    {madeOffer?"YOU":offer.nft_offer_address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                    {parseFloat(offer.offer_price)} ETH
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                    {new Date(offer.expirationTime * 1000).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                    <button 
                      className={`text-pink-500 ${(isNftOwner && (offer.expirationTime > Date.now() / 1000)) ? "hover:cursor-pointer text-pink-500 hover:text-pink-400 transition-colors duration-300 " : "hover:cursor-not-allowed"}`}
                      onClick={() => {handleAcceptOffer(offer)}}
                      disabled={!isNftOwner || (offer.expirationTime < Date.now() / 1000)}
                    >
                      Accept
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
      {isModalOpen && <Modal />}
      {isLoading && <LoadingOverlay />}
      {showSuccessModal && <SuccessModal />}
      {showFailModal && <FailModal />}
      {isInitializing && <InitializingModal />}
    </div>
  );
};

export default NFTDetail; 