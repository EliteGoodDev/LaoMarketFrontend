import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header />
      <main className="h-screen w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout; 