# Collaborative Blog Platform

This project is a blog application with a Node.js backend and an Angular frontend.

## How to install and run the project

### Backend

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_name>
    ```
2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory. Add the following environment variables (replace placeholders with your actual values):
    ```env
    PORT=3000 # Or any port you prefer
    MONGODB_URI=mongodb://localhost:27017/your_database_name # Your MongoDB connection string
    JWT_SECRET=your_jwt_secret # A strong secret for JWT signing
    ```
    *Note: Ensure you have MongoDB installed and running.*
5.  **Start the backend server:**
    ```bash
    npm start
    ```
    The backend server will typically be running on `http://localhost:3000` (or the port you specified).

### Frontend

1.  **Navigate to the frontend directory:**
    (Assuming you are in the root of the cloned repository)
    ```bash
    cd blog-collaborator-frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the frontend development server:**
    ```bash
    npm start
    ```
    The Angular development server will typically start the application on `http://localhost:4200/`. Open this URL in your browser.

**Note:** Ensure you have Node.js and npm installed on your system. For the backend, a running MongoDB instance is required.

## Project structure

The project is organized into two main directories: `backend` and `blog-collaborator-frontend`.

### Backend

The `backend` directory contains the Node.js Express application.

*   `app.js`: The main entry point for the backend application. It initializes the Express app, sets up middleware, and connects to the database.
*   `controllers/`: Contains the controllers that handle incoming requests, interact with services/models, and send responses.
    *   `articleController.js`: Handles article-related operations.
    *   `authController.js`: Handles user authentication and authorization.
    *   `commentController.js`: Handles comment-related operations.
    *   `notificationController.js`: Handles notification-related operations.
    *   `userController.js`: Handles user-related operations.
*   `middleware/`: Contains custom middleware functions used in the application.
    *   `authMiddleware.js`: Middleware for authenticating users using JWT.
    *   `rateLimiter.js`: Middleware for limiting API request rates.
*   `models/`: Defines the Mongoose schemas and models for the database.
    *   `article.js`: Schema for articles.
    *   `comment.js`: Schema for comments.
    *   `notification.js`: Schema for notifications.
    *   `user.js`: Schema for users.
*   `routes/`: Defines the API routes for different resources.
    *   `articleRoutes.js`: Routes for article-related endpoints.
    *   `authRoutes.js`: Routes for authentication endpoints.
    *   `commentRoutes.js`: Routes for comment-related endpoints.
    *   `notificationRoutes.js`: Routes for notification-related endpoints.
    *   `userRoutes.js`: Routes for user-related endpoints.
*   `wss/`: Contains the WebSocket service for real-time communication.
    *   `WebSocketService.js`: Implements the WebSocket server and handles real-time updates.
*   `.env`: (Should be created locally) Stores environment variables (e.g., database connection string, JWT secret).
*   `package.json`: Lists project dependencies and scripts.

### Frontend

The `blog-collaborator-frontend` directory contains the Angular application.

*   `src/`: Contains the source code for the Angular application.
    *   `app/`: Contains the core application logic, components, services, and modules.
        *   `admin/`: Components and services related to the admin dashboard.
        *   `articles/`: Components and services for creating, displaying, and managing articles.
        *   `auth/`: Components and services for user authentication (login, registration).
        *   `home/`: Components related to the home page.
        *   `notifications/`: Components for displaying user notifications.
        *   `app.component.ts`: The root component of the application.
        *   `app.config.ts`: Application-level configuration.
        *   `app.routes.ts`: Defines the main application routes.
    *   `assets/`: Contains static assets like images and fonts (though `public/favicon.ico` is outside this, it's a common pattern for favicons).
    *   `index.html`: The main HTML file that bootstraps the Angular application.
    *   `main.ts`: The main entry point for the Angular application.
    *   `styles.scss`: Global styles for the application.
*   `angular.json`: Angular CLI configuration file, including build and development settings.
*   `package.json`: Lists frontend dependencies and scripts.
*   `public/`: Contains static assets that are copied directly to the build output, like `favicon.ico`.

## Technical choices

### Backend

*   **Framework:** Express.js
*   **Database:** MongoDB (using Mongoose ODM)
*   **Authentication:** JSON Web Tokens (JWT) with bcryptjs for password hashing
*   **Real-time Communication:** WebSockets (ws)
*   **API:** RESTful API with body-parser for request parsing and CORS for cross-origin resource sharing
*   **Development:** Nodemon for automatic server restarts
*   **Environment Variables:** dotenv for managing environment configurations
*   **Rate Limiting:** express-rate-limit for API request throttling

### Frontend

*   **Framework:** Angular
*   **UI Components:** PrimeNG and Bootstrap
*   **State Management/Reactivity:** RxJS
*   **Build Tool:** Angular CLI
