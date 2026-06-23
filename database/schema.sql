-- CREATE DATABASE IF NOT EXISTS ai_recipe_generator;
-- USE ai_recipe_generator;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_preferences (
    user_id INT PRIMARY KEY,
    diet_type ENUM('vegetarian', 'non-vegetarian', 'vegan') DEFAULT 'non-vegetarian',
    allergies TEXT,
    calorie_limit INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100),
    image_url VARCHAR(500)
);

CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    cooking_time INT, -- in minutes
    calories INT,
    servings INT,
    difficulty ENUM('Easy', 'Medium', 'Hard'),
    diet_type ENUM('vegetarian', 'non-vegetarian', 'vegan'),
    creator_id INT,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE recipe_ingredients (
    recipe_id INT,
    ingredient_id INT,
    quantity VARCHAR(100),
    PRIMARY KEY (recipe_id, ingredient_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

CREATE TABLE favorite_recipes (
    user_id INT,
    recipe_id INT,
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE shopping_lists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity VARCHAR(100),
    is_purchased BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE generated_recipes_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    input_ingredients TEXT,
    recipe_name VARCHAR(255),
    recipe_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample Data
INSERT INTO ingredients (name, category) VALUES 
('Tomato', 'Vegetables'),
('Onion', 'Vegetables'),
('Eggs', 'Dairy/Protein'),
('Rice', 'Grains'),
('Milk', 'Dairy');
