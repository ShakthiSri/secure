import React, { useState } from 'react';
import './RecipeDrawer.css';

const RecipeDrawer = ({ isOpen, recipe, onClose }) => {
  const [isTimeExpanded, setIsTimeExpanded] = useState(false);

  if (!isOpen || !recipe) return null;

  const extractCalories = (nutrients) => {
    if (!nutrients || !nutrients.calories) return 'N/A';
    return nutrients.calories;
  };

  const nutritionFields = [
    { key: 'calories', label: 'Calories' },
    { key: 'carbohydrateContent', label: 'Carbohydrates' },
    { key: 'cholesterolContent', label: 'Cholesterol' },
    { key: 'fiberContent', label: 'Fiber' },
    { key: 'proteinContent', label: 'Protein' },
    { key: 'saturatedFatContent', label: 'Saturated Fat' },
    { key: 'sodiumContent', label: 'Sodium' },
    { key: 'sugarContent', label: 'Sugar' },
    { key: 'fatContent', label: 'Fat' }
  ];

  return (
    <>
      <div className="drawer-overlay" onClick={onClose}></div>
      <div className="drawer">
        <div className="drawer-header">
          <div>
            <h2>{recipe.title || 'Untitled Recipe'}</h2>
            <p className="drawer-cuisine">{recipe.cuisine || 'N/A'}</p>
          </div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        <div className="drawer-content">
          <div className="detail-section">
            <div className="detail-item">
              <span className="detail-label">Description:</span>
              <span className="detail-value">
                {recipe.description || 'No description available.'}
              </span>
            </div>

            <div className="detail-item">
              <div className="detail-label-row">
                <span className="detail-label">Total Time:</span>
                <button
                  className="expand-btn"
                  onClick={() => setIsTimeExpanded(!isTimeExpanded)}
                >
                  {isTimeExpanded ? '▼' : '▶'}
                </button>
              </div>
              <span className="detail-value">
                {recipe.total_time ? `${recipe.total_time} minutes` : 'N/A'}
              </span>
              {isTimeExpanded && (
                <div className="expanded-time">
                  <div className="time-detail">
                    <span className="time-label">Prep Time:</span>
                    <span className="time-value">
                      {recipe.prep_time ? `${recipe.prep_time} minutes` : 'N/A'}
                    </span>
                  </div>
                  <div className="time-detail">
                    <span className="time-label">Cook Time:</span>
                    <span className="time-value">
                      {recipe.cook_time ? `${recipe.cook_time} minutes` : 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="nutrition-section">
            <h3>Nutrition Information</h3>
            <table className="nutrition-table">
              <tbody>
                {nutritionFields.map((field) => (
                  <tr key={field.key}>
                    <td className="nutrition-label">{field.label}:</td>
                    <td className="nutrition-value">
                      {recipe.nutrients && recipe.nutrients[field.key]
                        ? recipe.nutrients[field.key]
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipeDrawer;

