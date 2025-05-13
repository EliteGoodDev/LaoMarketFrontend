import { useNavigate } from 'react-router-dom';

const NFTGrid = ({ filteredNfts }) => {
  const navigate = useNavigate();
  const handleNFTClick = (nft) => {
    navigate(`/nft/${nft.id}`, { state: { nft } });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredNfts.map((nft) => (
        <div 
          key={nft.id} 
          onClick={() => handleNFTClick(nft)}
          className="group bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        >
          <div className="relative pb-[100%] overflow-hidden">
            <img
              src={nft.image}
              alt={nft.name}
              className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-gray-200 group-hover:text-white transition-colors">
              {nft.name}
            </h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Current Price</p>
                <p className="text-lg font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                  {nft.price} ETH
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NFTGrid; 