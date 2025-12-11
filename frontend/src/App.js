import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import RecipeTable from './components/RecipeTable';
import RecipeDrawer from './components/RecipeDrawer';
import EmptyState from './components/EmptyState';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    title: '',
    cuisine: '',
    calories: '',
    total_time: '',
    rating: ''
  });
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Fetch recipes
  const fetchRecipes = async (currentPage = page, currentLimit = limit) => {
    setLoading(true);
    setError(null);
    
    try {
      const hasFilters = Object.values(filters).some(f => f.trim() !== '');
      
      if (hasFilters) {
        // Use search endpoint
        setIsSearchMode(true);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value.trim() !== '') {
            params.append(key, value);
          }
        });
        
        const response = await axios.get(`${API_BASE_URL}/recipes/search?${params.toString()}`);
        setRecipes(response.data.data || []);
        setTotal(response.data.data?.length || 0);
      } else {
        // Use paginated endpoint
        setIsSearchMode(false);
        const response = await axios.get(`${API_BASE_URL}/recipes?page=${currentPage}&limit=${currentLimit}`);
        setRecipes(response.data.data || []);
        setTotal(response.data.total || 0);
        setPage(response.data.page || 1);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError(err.message);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRecipe(null);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    setPage(1);
    fetchRecipes(1, limit);
  };

  const handleClearFilters = () => {
    setFilters({
      title: '',
      cuisine: '',
      calories: '',
      total_time: '',
      rating: ''
    });
    setPage(1);
    setIsSearchMode(false);
    fetchRecipes(1, limit);
  };

  const handlePageChange = (newPage) => {
    if (!isSearchMode) {
      setPage(newPage);
      fetchRecipes(newPage, limit);
    }
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    fetchRecipes(1, newLimit);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Recipes Collection</h1>
      </header>

      <main className="app-main">
        {loading && recipes.length === 0 ? (
          <div className="loading">Loading recipes...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : recipes.length === 0 ? (
          <EmptyState 
            message={isSearchMode ? "No recipes found matching your search criteria." : "No recipes available."}
          />
        ) : (
          <>
            <RecipeTable
              recipes={recipes}
              filters={filters}
              onRecipeClick={handleRecipeClick}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              onClearFilters={handleClearFilters}
              page={page}
              limit={limit}
              total={total}
              isSearchMode={isSearchMode}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
            
            <RecipeDrawer
              isOpen={isDrawerOpen}
              recipe={selectedRecipe}
              onClose={handleCloseDrawer}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;

