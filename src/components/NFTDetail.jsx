import { useLocation, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const NFTDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { account, marketplaceFee_origin, creatorRoyalty_origin } = useWeb3();
  const [nft, _setNft] = useState(location.state.nft);
  const [nftListed, _setNftListed] = useState(location.state.nftListed);
  const [isNftOwner, _setIsNftOwner] = useState(location.state.isNftOwner);
  const [offers, _setOffers] = useState(location.state.offers);
  const [madeOffer, setMadeOffer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("list");
  

  useEffect(() => {
    offers.forEach(offer => {
      if (offer.nft_offer_address.toLowerCase() == account.toLowerCase()) {
        setMadeOffer(true);
      }
    });
  }, [offers, account]);

  if (!nft) {
    return <div>NFT not found</div>;
  }

  if (!account) {
    return <div>Please connect your wallet to view the NFT details</div>;
  }

  const handleAcceptOffer = (offer) => {
    alert(`Accept Offer ${offer.nft_offer_address}, ID: ${nft.id}`);
  }

  const handleBuyNow = () => {
    alert(`Buy Now ID: ${nft.id} Price: ${nft.price} ETH`);
  }

  const handleUnlistNft = () => {
    alert(`Unlist NFT ID: ${nft.id}`);
  }

  const handleCancelOffer = () => {
    alert(`Cancel Offer ID: ${nft.id}`);
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
  const handleListNFT = () => {
    if (listPrice <= 0) {
      alert("Please enter a valid price");
      return;
    }
    alert(`List NFT ${nft.id} for ${listPrice} ETH`);
    setIsModalOpen(false);
  };

  const handleMakeOffer = () => {
    if (listPrice <= 0) {
      alert("Please enter a valid price");
      return;
    }
    alert(`Make Offer ${nft.id} for ${listPrice} ETH. Expiration: ${offerExpiration}`);
    setIsModalOpen(false);
  }

  const handleEditListing = () => {
    if (listPrice <= 0) {
      alert("Please enter a valid price");
      return;
    }
    alert(`Edit Listing ${nft.id} for ${listPrice} ETH`);
    setIsModalOpen(false);
  }

  const handleEditOffer = () => {
    if (listPrice <= 0) {
      alert("Please enter a valid price");
      return;
    }
    alert(`Edit Offer ${nft.id} for ${listPrice} ETH. Expiration: ${offerExpiration}`);
    setIsModalOpen(false);
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
                  <span className="text-gray-400">Expiration Time (days)</span>
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
            src={nft.image}
            alt={nft.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white">{nft.name}</h1>
          
          <div className="bg-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Traits</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(nft.traits).map(([trait, value]) => (
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
                {nft.price} ETH
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
      {isModalOpen && <Modal />}
    </div>
  );
};

export default NFTDetail; 