import { useState } from "react";

export default function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic API URL for both local and production
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    if (isRegistering) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || "Registration failed");
        }

        setSuccessMsg("Account created successfully! Please sign in.");
        setIsRegistering(false);
        setPassword(""); 
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }

    } else {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        });

        if (!response.ok) throw new Error("Incorrect email or password");

        const data = await response.json();
        localStorage.setItem("signature_app_token", data.access_token);
        onLoginSuccess(); 
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-extrabold text-slate-800 text-center mb-2">
          {isRegistering ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-slate-500 text-center mb-8">
          {isRegistering ? "Sign up to start signing documents" : "Sign in to your document workspace"}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-medium border border-red-100">
            ⚠️ {error}
          </div>
        )}
        
        {successMsg && (
          <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm font-medium border border-green-100">
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required={isRegistering}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded transition-colors mt-4 disabled:bg-indigo-400"
          >
            {isLoading ? "Please wait..." : (isRegistering ? "Sign Up" : "Sign In")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {isRegistering ? "Already have an account? " : "Don't have an account? "}
          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
              setSuccessMsg("");
            }} 
            className="text-indigo-600 font-semibold hover:underline"
          >
            {isRegistering ? "Sign in here" : "Create one now"}
          </button>
        </div>
      </div>
    </div>
  );
}