import { useState, useEffect } from "react";
function App() {
  const [message, setMessage] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(import.meta.env.VITE_API_URL)
        const response = await fetch(import.meta.env.VITE_API_URL);
        if (response.ok) {
          const result = await response.json();
          setMessage(result);
        } else {
          console.error("Error fetching data:", response.statusText);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <nav className="bg-red-50 py-4">
        <p className="font-light text-4xl text-red-400 px-20">Global English</p>
      </nav>
      <main className="flex justify-center items-center px-6 py-10 bg-red-100">
        <p>{JSON.stringify(message)}</p>
      </main>
    </>
  );
}

export default App;