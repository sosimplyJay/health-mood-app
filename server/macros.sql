CREATE TABLE meal_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    meal_description TEXT NOT NULL,
    calories FLOAT,
    sugar_grams FLOAT,
    protein FLOAT,
    carbs FLOAT,
    fats FLOAT,
    created_at TIMESTAMP DEFAULT now()
);
