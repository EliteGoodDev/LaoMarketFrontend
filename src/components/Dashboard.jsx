import { useState,useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import FilterSidebar from './FilterSidebar';
import NFTGrid from './NFTGrid';

const Dashboard = () => {
  const { isLoading, error, totalSupply, allTraits } = useWeb3();
  const { nfts } = useWeb3();
  const [filteredNfts, setFilteredNfts] = useState(nfts);
  const [activeFilters, setActiveFilters] = useState({
    priceRange: '',
    sortBy: 'newest',
    traits: {}
  });

  useEffect(() => {
    const sortedNfts = (activeFilters.sortBy === 'newest') ? nfts.sort((a, b) => a.id - b.id) : (activeFilters.sortBy === 'oldest') ? nfts.sort((a, b) => b.id - a.id) : (activeFilters.sortBy === 'price-low') ? nfts.sort((a, b) => a.price - b.price) : nfts.sort((a, b) => b.price - a.price);

    const priceFilteredNfts = sortedNfts.filter(nft => {
      if (activeFilters.priceRange === '') {
        return true;
      }
      const price = parseFloat(nft.price);
      const priceRange = activeFilters.priceRange.split('-');
      const minPrice = parseFloat(priceRange[0]);
      const maxPrice = parseFloat(priceRange[1]);
      return price >= minPrice && price <= maxPrice;
    });

    const traitFilteredNfts = priceFilteredNfts.filter(nft => {
      return Object.keys(activeFilters.traits).every(trait => {
        if(activeFilters.traits[trait] === '') {
          return true;
        }
        return nft.traits[trait] === activeFilters.traits[trait];
      });
    });

    setFilteredNfts(traitFilteredNfts);
  }, [nfts, activeFilters]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  return (
    <div className="flex h-full">
      <FilterSidebar onFilterChange={handleFilterChange} traits={allTraits} />
      <div className="flex-1 h-full overflow-y-auto px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Explore Collection</h2>
              <p className="text-gray-400">Total NFTs: {totalSupply}</p>
              <p className="text-gray-400">Filtered NFTs: {filteredNfts.length}</p>
            </div>
            {isLoading && (
              <div className="flex items-center text-white">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </div>
            )}
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>
        <NFTGrid filteredNfts={filteredNfts} />
      </div>
    </div>
  );
};

export default Dashboard;