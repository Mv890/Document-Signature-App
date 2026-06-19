const fetchDocs = async () => {
    if (!token) {
      alert("Please enter a JWT Token first!");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/docs/", { 
        headers: { "Authorization": `Bearer ${token}` } 
      });
      
      // If the backend rejects the token (401), stop and warn the user
      if (!res.ok) {
        alert("Authentication failed. Is your token correct?");
        setDocuments([]); // Set to empty array to prevent the .map() crash!
        return;
      }

      const data = await res.json();
      
      // Double check that data is actually an array before saving it
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