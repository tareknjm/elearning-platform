import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;