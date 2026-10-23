# Secure User Registration and Login System

## 1. Project Overview

This project is a responsive and secure user registration and login system developed as part of my internship task. It allows users to create an account, log in securely, access a protected dashboard, and log out.

The project uses Node.js and Express.js for the backend, SQLite for database storage, and HTML, CSS, and JavaScript for the frontend.

## 2. Project Objectives

- Build a complete user registration and login system.
- Validate user input.
- Store passwords securely using password hashing.
- Integrate a database.
- Manage authenticated user sessions.
- Protect routes and forms against common security risks.
- Create a responsive user interface.

## 3. Technologies Used

- HTML5 — page structure
- CSS3 — styling and responsive design
- JavaScript — frontend validation and API requests
- Node.js — JavaScript runtime
- Express.js — backend framework
- SQLite and better-sqlite3 — database integration
- bcryptjs — password hashing
- express-session — session management
- Helmet — security headers
- express-rate-limit — rate limiting
- dotenv — environment configuration

## 4. Software Requirements

- Windows computer
- Visual Studio Code
- Node.js and npm
- Google Chrome or another modern browser
- Internet connection for initial package installation

## 5. Project Development Steps

### Step 1: Install Node.js

1. Download and install Node.js.
2. Open the terminal.
3. Check the Node.js version:

   `node -v`

4. Check the npm version:

   `npm -v`

### Step 2: Create the Project Folder

1. Create a folder named `user-auth-system`.
2. Open Visual Studio Code.
3. Select File → Open Folder.
4. Choose the `user-auth-system` folder.

### Step 3: Initialize the Node.js Project

Open the VS Code terminal and run:

`npm init -y`

This creates the `package.json` file.

### Step 4: Install Dependencies

Run the following command:

`npm install express express-session better-sqlite3 bcryptjs helmet express-rate-limit dotenv`

These packages provide the backend framework, session handling, database support, password hashing, security headers, rate limiting, and environment configuration.

### Step 5: Create the Project Files

Create the following files and folders in the project directory:

- `server.js` — backend server and API routes
- `package.json` — project configuration and dependencies
- `.env` — private environment variables
- `.env.example` — example environment configuration with placeholder values
- `.gitignore` — files and folders excluded from Git
- `README.md` — project documentation
- `public/index.html` — registration and login interface
- `public/style.css` — user interface styling
- `public/script.js` — frontend validation and API requests
- `public/dashboard.html` — protected dashboard page
- `public/dashboard.js` — dashboard profile loading and logout
- `database/` — folder for the SQLite database

The SQLite database file is created or accessed by the backend code.

### Step 6: Configure Environment Variables

Create a `.env` file in the main project folder.

Add the environment variables required by `server.js`, including a strong, private `SESSION_SECRET`.

Do not publish the actual `.env` file or its secret on GitHub. Keep `.env` in `.gitignore`.

### Step 7: Build the Frontend

Create the registration and login forms using HTML.

Use CSS to style the forms and make the interface responsive.

Use JavaScript to validate email addresses, enforce password requirements, check password confirmation, and display user-friendly error messages.

### Step 8: Develop the Backend

Write the backend code in `server.js` using Express.js.

Create API routes for registration, login, retrieving the authenticated user's profile, obtaining a CSRF token, and logging out.

Validate incoming data on the server as well as on the frontend.

### Step 9: Connect the Database

Use SQLite to store registered users.

Create a users table containing the user's name, email, password hash, and account creation date.

Use parameterized SQL statements for database operations and enforce unique email addresses.

### Step 10: Implement Password Security

Use `bcryptjs` to hash passwords before saving them in the database.

Compare the submitted password with the stored hash during login. Never store plain-text passwords.

### Step 11: Implement Session Management

Use `express-session` to manage authenticated user sessions.

Regenerate the session after successful authentication, protect the dashboard from unauthenticated access, and destroy the session during logout.

### Step 12: Add Security Features

- Validate user input on the server.
- Use CSRF tokens for protected requests.
- Apply security headers with Helmet.
- Limit repeated authentication attempts.
- Use secure session-cookie settings appropriate to the environment.
- Keep secrets and database files out of the public repository.

### Step 13: Run the Project

1. Open the `user-auth-system` folder in VS Code.
2. Open Terminal → New Terminal.
3. Run:

   `node server.js`

4. Keep the terminal running.
5. Open a browser and visit:

   `http://localhost:3000`

Do not use Live Server's Go Live button for this Express application.

### Step 14: Test the Application

Test the following cases:

- Register a new account with valid details.
- Try registering with an existing email address.
- Enter an invalid email address.
- Try a password that does not meet the requirements.
- Attempt login with an incorrect password.
- Log in with valid credentials.
- Verify that the dashboard displays the authenticated user's details.
- Log out and verify that the dashboard redirects to the login page.

### Step 15: Prepare the Project for GitHub

1. Review `.gitignore`.
2. Ensure `.env`, `node_modules/`, and database files are excluded.
3. Add the final project description and author details to this README.
4. Review the files before uploading.
5. Never publish passwords, session secrets, or other private credentials.

## 16. Project Structure

    user-auth-system/
    ├── public/
    │   ├── index.html
    │   ├── style.css
    │   ├── script.js
    │   ├── dashboard.html
    │   └── dashboard.js
    ├── database/
    │   └── users.db
    ├── server.js
    ├── package.json
    ├── package-lock.json
    ├── .env
    ├── .env.example
    ├── .gitignore
    └── README.md

Note: `.env` and the actual database file are local files and should not be committed to a public repository.

## 17. Expected Result

The completed application provides registration, login, password hashing, database integration, session-based authentication, a protected dashboard, and logout functionality.

## 18. Learning Outcomes

Through this project, I practised frontend development, backend API development, database integration, password hashing, session management, input validation, and basic web application security.

## Security Best Practices Checklist

- **SQL Injection:** Database queries use parameterized statements instead of directly concatenating user input into SQL queries.
- **Password Security:** Passwords are hashed using bcryptjs before being stored in the database. Plain-text passwords are not stored.
- **Password Validation:** Passwords must meet the minimum length and complexity requirements.
- **Session Security:** Sessions use HTTP-only cookies, an appropriate SameSite setting, and secure cookies in production.
- **Input Validation:** User inputs are validated on the server. Client-side validation improves usability but is not treated as a security boundary.
- **XSS Mitigation:** User-provided data must be safely rendered and escaped. Avoid inserting untrusted input using `innerHTML`.
- **Rate Limiting:** Authentication endpoints have rate limiting to help reduce repeated login attempts.
- **Secrets Management:** Actual secrets and environment files are excluded from Git using `.gitignore`. Required variables are documented in `.env.example`.
- **Error Handling:** The application returns appropriate error responses without exposing passwords, session secrets, or sensitive server details.

## 19. Author

Name: Mahi Dangi

Project: Secure User Registration and Login System

