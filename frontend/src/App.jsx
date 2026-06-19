import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

export default function App() {
  // Use state to track auth. The initial value checks localStorage immediately.
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("signature_app_token");
  });

  // Optional: Add an effect to sync state if token changes elsewhere
  useEffect(() => {
    const checkToken = () => {
      setIsAuthenticated(!!localStorage.getItem("signature_app_token"));
    };
    
    // Listen for storage changes in other tabs
    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true); 
  };

  const handleLogout = () => {
    localStorage.removeItem("signature_app_token");
    setIsAuthenticated(false); 
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {isAuthenticated && (
        <nav className="bg-indigo-900 text-white p-3 text-right shadow-md">
          <button 
            onClick={handleLogout} 
            className="text-sm font-semibold hover:text-indigo-200 pr-4 transition-colors"
          >
            Log Out
          </button>
        </nav>
      )}
      
      <main className="flex-grow">
        {!isAuthenticated ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
}