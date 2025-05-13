import { useState, useEffect } from 'react';

const FilterSidebar = ({ onFilterChange, traits = {} }) => {
  // Initialize dynamic traits state
  const initialTraits = Object.fromEntries(
    Object.keys(traits).map(trait => [trait, ''])
  );

  const [filters, setFilters] = useState({
    priceRange: '',
    sortBy: 'newest',
    traits: initialTraits
  });

  // If traits prop changes (e.g. after fetch), update state
  useEffect(() => {
    setFilters(f => ({
      ...f,
      traits: Object.fromEntries(Object.keys(traits).map(trait => [trait, '']))
    }));
  }, [traits]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTraitChange = (trait, value) => {
    const newFilters = {
      ...filters,
      traits: {
        ...filters.traits,
        [trait]: value
      }
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="w-72 h-screen max-h-screen overflow-y-auto flex-shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
        Filters
      </h2>
      
      {/* Price Range Filter */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-200">Price Range</h3>
        <select
          className="w-full p-3 bg-gray-800 text-white border border-pink-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
          value={filters.priceRange}
          onChange={e => handleFilterChange('priceRange', e.target.value)}
        >
          <option value="">All Prices</option>
          <option value="0-1">0 - 1 ETH</option>
          <option value="1-5">1 - 5 ETH</option>
          <option value="5-10">5 - 10 ETH</option>
          <option value="10+">10+ ETH</option>
        </select>
      </div>

      {/* Sort By Filter */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-200">Sort By</h3>
        <select
          className="w-full p-3 bg-gray-800 text-white border border-pink-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
          value={filters.sortBy}
          onChange={e => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="newest">Token ID: Low to High</option>
          <option value="oldest">Token ID: High to Low</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* Dynamic Traits Filter */}
      {Object.keys(traits).length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-200">Traits</h3>
          {Object.entries(traits).map(([traitType, values]) => (
            <div className="mb-4" key={traitType}>
              <label className="block text-sm text-gray-400 mb-2 capitalize">
                {traitType}
              </label>
              <select
                className="w-full p-3 bg-gray-800 text-white border border-pink-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                value={filters.traits[traitType] || ''}
                onChange={e => handleTraitChange(traitType, e.target.value)}
              >
                <option value="">Any</option>
                {values.map(val => (
                  <option value={val} key={val}>{val}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterSidebar; 