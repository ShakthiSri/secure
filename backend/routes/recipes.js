const express = require('express');
const router = express.Router();
const pool = require('../database/db');

/**
 * Parse filter operators (e.g., "<=400", ">=4.5", "=100")
 */
function parseFilter(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  
  // Check for operators
  if (trimmed.startsWith('<=')) {
    return { operator: '<=', value: parseFloat(trimmed.substring(2)) };
  } else if (trimmed.startsWith('>=')) {
    return { operator: '>=', value: parseFloat(trimmed.substring(2)) };
  } else if (trimmed.startsWith('<')) {
    return { operator: '<', value: parseFloat(trimmed.substring(1)) };
  } else if (trimmed.startsWith('>')) {
    return { operator: '>', value: parseFloat(trimmed.substring(1)) };
  } else if (trimmed.startsWith('=')) {
    return { operator: '=', value: parseFloat(trimmed.substring(1)) };
  } else {
    // Default to equals for numeric, or use as-is for string
    const numValue = parseFloat(trimmed);
    return isNaN(numValue) 
      ? { operator: '=', value: trimmed } 
      : { operator: '=', value: numValue };
  }
}

/**
 * Extract numeric value from calories string (e.g., "389 kcal" -> 389)
 */
function extractCalories(caloriesStr) {
  if (!caloriesStr || typeof caloriesStr !== 'string') {
    return null;
  }
  const match = caloriesStr.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * GET /api/recipes
 * Get all recipes with pagination, sorted by rating (descending)
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return res.status(400).json({ 
        error: 'Page and limit must be positive integers' 
      });
    }

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM recipes');
    const total = parseInt(countResult.rows[0].count);

    // Get paginated recipes sorted by rating (descending)
    const query = `
      SELECT 
        id, cuisine, title, rating, prep_time, cook_time, 
        total_time, description, nutrients, serves
      FROM recipes
      ORDER BY rating DESC NULLS LAST, id ASC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);

    res.json({
      page,
      limit,
      total,
      data: result.rows.map(row => ({
        ...row,
        nutrients: row.nutrients || {}
      }))
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/recipes/search
 * Search recipes with various filters
 */
router.get('/search', async (req, res) => {
  try {
    const { calories, title, cuisine, total_time, rating } = req.query;

    let query = 'SELECT id, cuisine, title, rating, prep_time, cook_time, total_time, description, nutrients, serves FROM recipes WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    // Filter by calories (from nutrients JSONB)
    if (calories) {
      const filter = parseFilter(calories);
      if (filter && !isNaN(filter.value)) {
        // Extract numeric value from calories string in nutrients
        if (filter.operator === '<=') {
          query += ` AND CAST(REGEXP_REPLACE(nutrients->>'calories', '[^0-9.]', '', 'g') AS FLOAT) <= $${paramIndex}`;
        } else if (filter.operator === '>=') {
          query += ` AND CAST(REGEXP_REPLACE(nutrients->>'calories', '[^0-9.]', '', 'g') AS FLOAT) >= $${paramIndex}`;
        } else if (filter.operator === '<') {
          query += ` AND CAST(REGEXP_REPLACE(nutrients->>'calories', '[^0-9.]', '', 'g') AS FLOAT) < $${paramIndex}`;
        } else if (filter.operator === '>') {
          query += ` AND CAST(REGEXP_REPLACE(nutrients->>'calories', '[^0-9.]', '', 'g') AS FLOAT) > $${paramIndex}`;
        } else {
          query += ` AND CAST(REGEXP_REPLACE(nutrients->>'calories', '[^0-9.]', '', 'g') AS FLOAT) = $${paramIndex}`;
        }
        queryParams.push(filter.value);
        paramIndex++;
      }
    }

    // Filter by title (partial match, case-insensitive)
    if (title) {
      query += ` AND title ILIKE $${paramIndex}`;
      queryParams.push(`%${title}%`);
      paramIndex++;
    }

    // Filter by cuisine (exact match, case-insensitive)
    if (cuisine) {
      query += ` AND cuisine ILIKE $${paramIndex}`;
      queryParams.push(cuisine);
      paramIndex++;
    }

    // Filter by total_time
    if (total_time) {
      const filter = parseFilter(total_time);
      if (filter && !isNaN(filter.value)) {
        if (filter.operator === '<=') {
          query += ` AND total_time <= $${paramIndex}`;
        } else if (filter.operator === '>=') {
          query += ` AND total_time >= $${paramIndex}`;
        } else if (filter.operator === '<') {
          query += ` AND total_time < $${paramIndex}`;
        } else if (filter.operator === '>') {
          query += ` AND total_time > $${paramIndex}`;
        } else {
          query += ` AND total_time = $${paramIndex}`;
        }
        queryParams.push(filter.value);
        paramIndex++;
      }
    }

    // Filter by rating
    if (rating) {
      const filter = parseFilter(rating);
      if (filter && !isNaN(filter.value)) {
        if (filter.operator === '<=') {
          query += ` AND rating <= $${paramIndex}`;
        } else if (filter.operator === '>=') {
          query += ` AND rating >= $${paramIndex}`;
        } else if (filter.operator === '<') {
          query += ` AND rating < $${paramIndex}`;
        } else if (filter.operator === '>') {
          query += ` AND rating > $${paramIndex}`;
        } else {
          query += ` AND rating = $${paramIndex}`;
        }
        queryParams.push(filter.value);
        paramIndex++;
      }
    }

    // Order by rating descending
    query += ' ORDER BY rating DESC NULLS LAST, id ASC';

    const result = await pool.query(query, queryParams);

    res.json({
      data: result.rows.map(row => ({
        ...row,
        nutrients: row.nutrients || {}
      }))
    });
  } catch (error) {
    console.error('Error searching recipes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

