# HW 4: Registration App Authentication with Supabase

## 🛠️ Why Use Supabase?
Authentication can be error-prone when building an application. Handling **user registration, email verification, login, and database management** can be painful with traditional setups that require managing your own database and email services. 

**Supabase simplifies authentication** by providing a backend-as-a-service solution with built-in **PostgreSQL, authentication, and email handling**. With Supabase, we no longer need to manually manage user accounts, write our own authentication logic, or send emails ourselves.

This new version of our **Registration App** replaces our old authentication system with Supabase, significantly reducing complexity and making it easier to maintain. 

Clone this repo to get started: https://github.com/amoretti86/digitalentrepreneurship-lab3b

---

## 🔄 What Changed?
### ❌ Removed Files
1. **`db.js`** – We no longer need to manually create a PostgreSQL database and handle users. Supabase manages the database for us.
2. **`email.js`** – Supabase handles email verification automatically, eliminating the need for our custom email-sending logic.
3. **`migration.js`** – Since Supabase manages the database schema, we no longer need to run manual migrations.
4. **Heroku Postgres Add-On** – Supabase provides a **fully managed PostgreSQL database**, so we don't need to add a separate database on Heroku.

---

## 🛠️ How to Set Up Supabase

### 1️⃣ **Sign Up for Supabase**
1. Go to [https://supabase.com/](https://supabase.com/) and create an account.
2. Click **"New Project"** and give it a name.
3. Choose a strong password for the database and click **"Create new project"**.
4. Wait for Supabase to set up your database (this may take a few seconds).

### 2️⃣ **Obtain Your Supabase Keys**
Once your project is created:
1. Go to **"Settings" → "API"** in the Supabase Dashboard.
2. Copy the following values:
   - **Supabase URL**
   - **Anon Key**
   - **Service Role Key** (Needed for admin operations)

---

## 🌍 Updating the Backend

### 3️⃣ **Set Up Environment Variables**
In your backend project, create a `.env` file and add:
```bash
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=5000
```
📌 **Check your spam folder** for the email verification code when signing up!

### 4️⃣ **Install Dependencies**
We need the Supabase SDK to connect to our authentication system. Install it by running:
```bash
npm install @supabase/supabase-js
```

### 5️⃣ **Update `server.js` to Use Supabase**
Modify the backend to use Supabase for authentication:
```javascript
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

### 6️⃣ **Registering a User**
Replace manual database inserts with Supabase's authentication system:
```javascript
const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } } // Store additional user info
});
```

### 7️⃣ **Email Verification Using a 6-Digit Code**
Instead of email links, users enter a **6-digit verification code**:
```javascript
const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: verificationCode,  // The 6-digit code from the email
    type: "signup"
});
```
📌 **Users must manually enter the verification code from their email.**

### 8️⃣ **Logging In Users**
Login now uses Supabase authentication:
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
});
```

---

## 🗄️ Accessing the Supabase Database
To view and manage user accounts:
1. **Go to Supabase Dashboard** → Click **"Authentication"** → **"Users"**.
2. You can manually verify users, delete accounts, or reset passwords.
3. To query the database directly, go to **"Database" → "Table Editor"**.

📌 You can also query data programmatically using the **Supabase SDK**:
```javascript
const { data, error } = await supabase.from("users").select("*");
```

---

## 🚀 Deploying to Heroku
Since we are using Supabase for authentication and storage, we **no longer need to add Heroku Postgres**.

### Steps to Deploy:
1. **Set environment variables on Heroku**
```bash
heroku config:set SUPABASE_URL=your-supabase-url
heroku config:set SUPABASE_ANON_KEY=your-anon-key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
heroku config:set PORT=5000
```

2. **Push your code to Heroku**
```bash
git add .
git commit -m "Deploy Supabase backend to Heroku"
git push heroku main  # or 'master' if using older repo
```

3. **Restart the app**
```bash
heroku restart
```

4. **Check logs for errors**
```bash
heroku logs --tail
```

---

## 🎯 Summary
✅ **No need for manual PostgreSQL setup** – Supabase handles it.
✅ **No need for custom email handling** – Supabase sends verification codes.
✅ **Faster and easier authentication** with Supabase's built-in auth.
✅ **Easier database access** via Supabase UI and SDK.
✅ **Simpler deployment** – Just set environment variables and deploy!

This version of the **Registration App** is now **much simpler and more scalable** with Supabase.