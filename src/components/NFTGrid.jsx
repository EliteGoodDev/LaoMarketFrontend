const NFTGrid = ({ nfts }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <div 
          key={nft.id} 
          className="group bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
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
              <button className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Buy Now
              </button>
            </div>
            {/* <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(nft.traits).map(([trait, value]) => (
                <span 
                  key={trait}
                  className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300 border border-white/20"
                >
                  {trait}: {value}
                </span>
              ))}
            </div> */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NFTGrid; 