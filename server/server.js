// Import required modules
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const axios = require('axios');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Mistral API Key (set in your .env file)
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

const app = express();
app.use(express.json());

// Serve static files from React build folder
app.use(express.static(path.join(__dirname, '../client/build')));

// ========================================================
// Authentication Routes using Supabase Auth
// ========================================================

// Registration endpoint using Supabase Auth
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    console.log(`Received registration request for email: ${email}`);

    // Email validation
    const emailPattern = /@(spelman\.edu|morehouse\.edu)$/;
    if (!emailPattern.test(email)) {
        return res.status(400).json({ success: false, message: 'Email must end with @spelman.edu or @morehouse.edu.' });
    }

    try {
        // Register user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } } // Store additional user info
        });

        if (error) throw error;

        res.json({ success: true, message: 'Registration successful. Check your email for verification.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: error.message || 'Error registering user' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Received login request for email: ${email}`);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        res.json({ success: true, message: 'Login successful', user: data.user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
});

// Email verification using 6-digit code
app.post('/verify', async (req, res) => {
    const { email, verificationCode } = req.body;
    console.log(`Verifying email: ${email} with code: ${verificationCode}`);

    try {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: verificationCode,
            type: 'signup'
        });

        if (error) {
            console.error('Verification failed:', error);
            return res.status(400).json({ success: false, message: 'Invalid verification code.' });
        }

        res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ success: false, message: 'Error verifying email' });
    }
});


// Endpoint to analyze meal and store results
app.post('/analyze-meal', async (req, res) => {
    const { user_email, meal_description } = req.body;

    if (!user_email || !meal_description) {
        return res.status(400).json({ error: "Missing user_email or meal_description" });
    }

    try {
        // Call Mistral API for meal analysis
        const response = await axios.post("https://api.mistral.ai/v1/chat/completions", {
            model: "mistral-medium",
            messages: [
                { role: "system", content: "You are a nutritionist AI." },
                { role: "user", content: `Estimate the calories, sugar (grams), protein, carbs, and fats for this meal: ${meal_description}. Return values in a comma-separated format: Calories, Sugar(g), Protein(g), Carbs(g), Fats(g).` }
            ]
        }, {
            headers: { Authorization: `Bearer ${MISTRAL_API_KEY}` }
        });

        const analysis = response.data.choices[0].message.content;
        const [calories, sugar_grams, protein, carbs, fats] = analysis.split(',').map(Number);

        // Store in Supabase
        const { data, error } = await supabase.from('meal_logs').insert([
            { user_email, meal_description, calories, sugar_grams, protein, carbs, fats }
        ]);

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error("Meal analysis error:", error);
        res.status(500).json({ error: "Failed to analyze meal" });
    }
});

app.get('/meal-logs', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Missing email parameter" });

    try {
        const { data, error } = await supabase
            .from('meal_logs')
            .select('*')
            .eq('user_email', email)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error("Error fetching meal logs:", error);
        res.status(500).json({ error: "Failed to fetch meal logs" });
    }
});




// Fallback route to serve React frontend for any unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});