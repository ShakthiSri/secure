/**
 * Parse and sanitize recipe data from JSON
 * Handles NaN values by converting them to NULL
 */
function parseRecipe(recipeData) {
  // Helper function to check if value is NaN or invalid
  function sanitizeNumber(value) {
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      if (lower === 'nan' || lower === '' || lower === 'null' || lower === 'undefined') {
        return null;
      }
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    }
    if (typeof value === 'number') {
      return isNaN(value) ? null : value;
    }
    return null;
  }

  // Helper function to sanitize string values
  function sanitizeString(value) {
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value === 'string') {
      return value.trim() || null;
    }
    return String(value).trim() || null;
  }

  return {
    cuisine: sanitizeString(recipeData.cuisine),
    title: sanitizeString(recipeData.title),
    rating: sanitizeNumber(recipeData.rating),
    prep_time: sanitizeNumber(recipeData.prep_time),
    cook_time: sanitizeNumber(recipeData.cook_time),
    total_time: sanitizeNumber(recipeData.total_time),
    description: sanitizeString(recipeData.description),
    nutrients: recipeData.nutrients && typeof recipeData.nutrients === 'object' 
      ? recipeData.nutrients 
      : null,
    serves: sanitizeString(recipeData.serves),
  };
}

module.exports = { parseRecipe };

