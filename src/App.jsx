import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import NFTDetail from './components/NFTDetail';
import Layout from './components/Layout';
import { Web3Provider } from './context/Web3Context';

function App() {
  return (
    <Router>
      <Web3Provider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/nft/:id" element={<NFTDetail />} />
          </Routes>
        </Layout>
      </Web3Provider>
    </Router>
  );
}

export default App;
