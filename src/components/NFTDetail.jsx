import { useLocation, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useState, useEffect } from 'react';


const NFTDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { account } = useWeb3();
  const [nft, _setNft] = useState(location.state.nft);
  const [nftListed, _setNftListed] = useState(location.state.nftListed);
  const [isNftOwner, _setIsNftOwner] = useState(location.state.isNftOwner);
  const [offers, _setOffers] = useState(location.state.offers);
  const [madeOffer, setMadeOffer] = useState(false);

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
            <h2 className="text-xl font-semibold mb-4 text-white">Price</h2>
            <p className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              {nft.price} ETH
            </p>
            <div className="flex justify-center gap-8">
            {isNftOwner ? 
              (
                nftListed ? 
                (
                  <>
                    <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer">
                      Edit Listing
                    </button>
                    <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer">
                      Unlist NFT
                    </button>
                  </>
                )
                :
                <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer">
                  List NFT
                </button>
              ) 
              : 
              (
                
                nftListed && madeOffer ?
                <>
                  <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer">
                    Buy Now
                  </button>
                  <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer">
                    Update Offer
                  </button>
                  <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer">
                    Cancel Offer
                  </button>
                </>
                  :
                !nftListed && madeOffer ?
                <>
                  <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer">
                    Update Offer
                  </button>
                  <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer">
                    Cancel Offer
                  </button>
                </>
                :
                nftListed && !madeOffer ?
                <>
                  <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer">
                    Buy Now
                  </button>
                  <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer">
                    Make Offer
                  </button>
                </>
                :
                <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer">
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
                      className={`text-pink-500 ${isNftOwner ? "hover:cursor-pointer text-pink-500 hover:text-pink-400 transition-colors duration-300 " : "hover:cursor-not-allowed"}`}
                      onClick={() => {handleAcceptOffer(offer)}}
                      disabled={!isNftOwner}
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
    </div>
  );
};

export default NFTDetail; 