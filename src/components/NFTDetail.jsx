import { useLocation, useNavigate } from 'react-router-dom';

const NFTDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { nft } = location.state || {};

  if (!nft) {
    return <div>NFT not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
      >
        ← Back
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-2xl overflow-hidden">
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
            <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetail; 