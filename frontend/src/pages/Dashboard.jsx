// 1. Get the live URL from Vercel, or fallback to localhost if testing locally
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const fetchDocs = async () => {
    if (!token) {
      alert("Please enter a JWT Token first!");
      return;
    }

    try {
      // 2. Use the dynamic API_BASE_URL here instead of hardcoding localhost
      const res = await fetch(`${API_BASE_URL}/api/docs/`, { 
        headers: { "Authorization": `Bearer ${token}` } 
      });
      
      if (!res.ok) {
        alert("Authentication failed. Is your token correct?");
        setDocuments([]); 
        return;
      }

      const data = await res.json();
      
      if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        setDocuments([]);
      }
      
    } catch (error) {
      console.error("Network error:", error);
      setDocuments([]);
    }
  };