# HW 3: Registration App with Dashboard

This repository provides a demonstration of a simple React registration app with a dashboard component. It implements user registration, email verification, login functionality, and a basic dashboard that displays after successful authentication.

---

## 🚨 Important Note for Students 🚨

This repository is provided as a reference implementation only. You must modify and customize this code significantly to receive credit for your assignment. Simply cloning and submitting this code without substantial modifications will not meet the assignment requirements.

---

## Assignment Requirements

For HW 3, you need to:

- Create a functional dashboard component that appears post-login
- Ensure the dashboard maintains proper authentication state
- Include a logout option that returns to the login screen
- Deploy your app to Heroku and link the live URL

---

## Customization Ideas

To make this project your own, consider implementing some of these modifications:

- Design a dashboard that aligns with your specific MVP plans
- Add additional components to your dashboard 
- Improve the styling to match your application's branding
- Enhance user authentication with features like "remember me" or password reset
- Add form validation beyond the basic email domain check
- Create a more sophisticated backend with additional routes and features
- Implement proper error handling and user feedback

---

## Technology Stack

- **Frontend:** React.js with hooks for state management
- **Backend:** Node.js with Express
- **Database:** PostgreSQL for user data storage
- **Email:** Brevo API for email verification

---

## Getting Started

1. **Clone this repository**

2. **Install dependencies:**

   ```bash
   npm install
   cd client
   npm install

3. **Set up your environment variables in a `.env` file:**
```
DATABASE_URL=your_postgres_connection_string
BREVO_API_KEY=your_brevo_api_key
```

4. **Run the database migration:**
```
node migration.js
```

5. **Start the development server:**
```
node server.js
```

Deploying to Heroku
Make sure to add the postgres addon:
```
heroku addons:create heroku-postgresql:essential-0
```
