const fs = require('fs');
const path = require('path');
const pool = require('../database/db');
const { parseRecipe } = require('../utils/parseRecipe');
require('dotenv').config();

async function importRecipes() {
  try {
    // Get JSON file path from command line argument or use default
    const jsonFilePath = process.argv[2] || path.join(__dirname, '../../data/recipes.json');
    
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`Error: JSON file not found at ${jsonFilePath}`);
      console.log('Usage: node importRecipes.js <path-to-recipes.json>');
      process.exit(1);
    }

    console.log(`Reading recipes from ${jsonFilePath}...`);
    const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
    const recipes = JSON.parse(fileContent);

    if (!Array.isArray(recipes)) {
      console.error('Error: JSON file must contain an array of recipes');
      process.exit(1);
    }

    console.log(`Found ${recipes.length} recipes to import...`);

    // Clear existing data (optional - comment out if you want to keep existing data)
    await pool.query('TRUNCATE TABLE recipes RESTART IDENTITY CASCADE');
    console.log('Cleared existing recipes...');

    // Insert recipes in batches
    const batchSize = 100;
    let imported = 0;

    for (let i = 0; i < recipes.length; i += batchSize) {
      const batch = recipes.slice(i, i + batchSize);
      const values = [];
      const placeholders = [];

      batch.forEach((recipe, index) => {
        const parsed = parseRecipe(recipe);
        const baseIndex = index * 9;
        values.push(
          parsed.cuisine,
          parsed.title,
          parsed.rating,
          parsed.prep_time,
          parsed.cook_time,
          parsed.total_time,
          parsed.description,
          JSON.stringify(parsed.nutrients),
          parsed.serves
        );
        placeholders.push(
          `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}::jsonb, $${baseIndex + 9})`
        );
      });

      const query = `
        INSERT INTO recipes (cuisine, title, rating, prep_time, cook_time, total_time, description, nutrients, serves)
        VALUES ${placeholders.join(', ')}
      `;

      await pool.query(query, values);
      imported += batch.length;
      console.log(`Imported ${imported}/${recipes.length} recipes...`);
    }

    console.log(`\nSuccessfully imported ${imported} recipes!`);
    process.exit(0);
  } catch (error) {
    console.error('Error importing recipes:', error);
    process.exit(1);
  }
}

importRecipes();

