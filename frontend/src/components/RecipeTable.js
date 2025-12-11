import React, { useState } from 'react';
import './RecipeTable.css';
import StarRating from './StarRating';

const RecipeTable = ({
  recipes,
  filters,
  onRecipeClick,
  onFilterChange,
  onSearch,
  onClearFilters,
  page,
  limit,
  total,
  isSearchMode,
  onPageChange,
  onLimitChange
}) => {
  const [expandedFilters, setExpandedFilters] = useState(false);

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const extractCalories = (nutrients) => {
    if (!nutrients || !nutrients.calories) return 'N/A';
    return nutrients.calories;
  };

  const extractServesNumber = (serves) => {
    if (!serves) return 'N/A';
    const match = serves.match(/(\d+)/);
    return match ? match[1] : 'N/A';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="recipe-table-container">
      <div className="filters-section">
        <button
          className="filter-toggle"
          onClick={() => setExpandedFilters(!expandedFilters)}
        >
          {expandedFilters ? '▼' : '▶'} Filters
        </button>
        
        {expandedFilters && (
          <div className="filters-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={filters.title}
                  onChange={(e) => onFilterChange('title', e.target.value)}
                  placeholder="Search by title..."
                />
              </div>
              
              <div className="filter-group">
                <label>Cuisine:</label>
                <input
                  type="text"
                  value={filters.cuisine}
                  onChange={(e) => onFilterChange('cuisine', e.target.value)}
                  placeholder="Filter by cuisine..."
                />
              </div>
              
              <div className="filter-group">
                <label>Calories:</label>
                <input
                  type="text"
                  value={filters.calories}
                  onChange={(e) => onFilterChange('calories', e.target.value)}
                  placeholder="e.g., <=400, >=300"
                />
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-group">
                <label>Total Time (min):</label>
                <input
                  type="text"
                  value={filters.total_time}
                  onChange={(e) => onFilterChange('total_time', e.target.value)}
                  placeholder="e.g., <=60, >=30"
                />
              </div>
              
              <div className="filter-group">
                <label>Rating:</label>
                <input
                  type="text"
                  value={filters.rating}
                  onChange={(e) => onFilterChange('rating', e.target.value)}
                  placeholder="e.g., >=4.5, <=3.0"
                />
              </div>
              
              <div className="filter-actions">
                <button onClick={onSearch} className="search-btn">Search</button>
                <button onClick={onClearFilters} className="clear-btn">Clear</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="table-wrapper">
        <table className="recipe-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Cuisine</th>
              <th>Rating</th>
              <th>Total Time</th>
              <th>Serves</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe) => (
              <tr
                key={recipe.id}
                onClick={() => onRecipeClick(recipe)}
                className="recipe-row"
              >
                <td className="title-cell" title={recipe.title}>
                  {truncateText(recipe.title, 60)}
                </td>
                <td>{recipe.cuisine || 'N/A'}</td>
                <td>
                  <StarRating rating={recipe.rating} />
                </td>
                <td>{recipe.total_time ? `${recipe.total_time} min` : 'N/A'}</td>
                <td>{extractServesNumber(recipe.serves)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isSearchMode && (
        <div className="pagination-section">
          <div className="pagination-controls">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="page-btn"
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {page} of {totalPages} (Total: {total} recipes)
            </span>
            
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="page-btn"
            >
              Next
            </button>
          </div>
          
          <div className="limit-controls">
            <label>Results per page:</label>
            <select
              value={limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value))}
              className="limit-select"
            >
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={25}>25</option>
              <option value={30}>30</option>
              <option value={40}>40</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeTable;

