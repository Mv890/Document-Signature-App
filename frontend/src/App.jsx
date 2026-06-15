import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("signature_app_token") ? true : false;
  });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true); 
  };

  const handleLogout = () => {
    localStorage.removeItem("signature_app_token");
    setIsAuthenticated(false); 
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div>
      <div className="bg-indigo-900 text-white p-2 text-right">
        <button onClick={handleLogout} className="text-sm font-medium hover:text-indigo-200 pr-4">
          Log Out
        </button>
      </div>
      <Dashboard />
    </div>
  );
}