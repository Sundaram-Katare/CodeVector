import { useState, useEffect } from 'react';
import './App.css';

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Books",
  "Sports",
  "Beauty",
  "Home",
  "Toys",
  "Grocery",
];

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [cursors, setCursors] = useState([]); 
  const [pageIndex, setPageIndex] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);

  useEffect(() => {
    setCursors([]);
    setPageIndex(0);
    setNextCursor(null);
    fetchData("All" === category ? null : category, null);
  }, [category]);

  const fetchData = async (cat, cursor) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("limit", "20");
      if (cat && cat !== "All") params.append("category", cat);
      if (cursor) params.append("cursor", cursor);

      const res = await fetch(`https://codevector-5b66.onrender.com/api/products?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.data);
        setNextCursor(data.nextCursor);
      } else {
        setError(data.message || "Failed to fetch products");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!nextCursor) return;
    const newCursors = [...cursors];
    newCursors[pageIndex] = nextCursor;
    setCursors(newCursors);
    setPageIndex(pageIndex + 1);
    fetchData(category, nextCursor);
  };

  const handlePrev = () => {
    if (pageIndex === 0) return;
    const prevIndex = pageIndex - 1;
    const prevCursor = prevIndex === 0 ? null : cursors[prevIndex - 1];
    setPageIndex(prevIndex);
    fetchData(category, prevCursor);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>CodeVector Products</h1>
        <p>Discover our amazing collection of high-quality items</p>
      </header>

      <main className="main-content">
        <aside className="sidebar">
          <h2>Categories</h2>
          <ul className="category-list">
            {categories.map(c => (
              <li key={c}>
                <button 
                  className={category === c ? "active" : ""} 
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="product-section">
          {error && <div className="error">{error}</div>}
          
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.length === 0 && !loading && !error && (
                  <div className="no-products">No products found for this category.</div>
                )}
                {products.map(p => (
                  <div key={p.id} className="product-card">
                    <div className="product-image-placeholder">
                       <span>{p.category}</span>
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{p.name}</h3>
                      <div className="product-meta">
                        <span className="product-category">{p.category}</span>
                        <span className="product-price">${parseFloat(p.price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {products.length > 0 && (
                <div className="pagination">
                  <button 
                    disabled={pageIndex === 0 || loading} 
                    onClick={handlePrev}
                    className="btn"
                  >
                    Previous
                  </button>
                  <span className="page-info">Page {pageIndex + 1}</span>
                  <button 
                    disabled={!nextCursor || loading} 
                    onClick={handleNext}
                    className="btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
