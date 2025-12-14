# HackVerse

HackVerse is a comprehensive hackathon management platform designed to streamline the organization and participation process for hackathons. It facilitates seamless interaction between organizers, participants, and administrators, offering tools for event creation, team formation, project submission, and real-time collaboration.

## Features

- **User Authentication**: Secure signup and login via Email/Password, Google, and GitHub strategies.
- **Role-Based Access Control**: specialized dashboards and features for Users, Organizers, and Admins.
- **Event Management**: Organizers can create, update, and manage hackathon details, schedules, and assets.
- **Team Formation & Management**: Participants can create teams, invite members, and manage join requests.
- **Real-time Updates**: Instant notifications and live updates using Socket.io for events and messages.
- **Interactive Dashboard**: Personalized views for managing upcoming events, active teams, and notifications.
- **Project Submission**: Teams can submit their final projects with descriptions, repository links, and demos.
- **Live Leaderboard**: Real-time tracking of team scores and standings during events.
- **In-App Messaging**: Integrated chat functionality for seamless team communication.
- **Admin Panel**: Comprehensive tools for platform oversight, user management, and content moderation.

## Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: React Context, Hooks
- **Routing**: React Router DOM (v7)
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: Passport.js (Google, GitHub), JSON Web Token (JWT), Bcrypt
- **Real-time**: Socket.io
- **File Storage**: Cloudinary (via Multer)
- **Email Service**: Nodemailer
- **Security**: Helmet, Express Rate Limit, Csurf (CSRF Protection)
- **Validation**: Express Validator

## Prerequisites

Before running the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas cluster)

You will also need accounts/API keys for:
- [Cloudinary](https://cloudinary.com/) (for image uploads)
- Google Cloud Console (for OAuth)
- GitHub Developer Settings (for OAuth)
- A reliable SMTP service (e.g., Gmail) for emails

## Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Harshita251005/HackVerse.git
    cd HackVerse
    ```

2.  **Backend Setup**
    Navigate to the backend directory and install dependencies:
    ```bash
    cd backend
    npm install
    ```

    Create a `.env` file in the `backend` directory based on the `.env.template` file:
    ```bash
    cp .env.template .env
    ```
    
    Update the `.env` file with your specific credentials:
    ```env
    PORT=4000
    MONGODB_URI=<your_mongodb_connection_string>
    
    JWT_SECRET=<your_secure_jwt_secret>
    SESSION_SECRET=<your_secure_session_secret>
    
    CLIENT_URL=http://localhost:5173
    FRONTEND_URL=http://localhost:5173
    
    GOOGLE_CLIENT_ID=<your_google_client_id>
    GOOGLE_CLIENT_SECRET=<your_google_client_secret>
    GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
    
    GITHUB_CLIENT_ID=<your_github_client_id>
    GITHUB_CLIENT_SECRET=<your_github_client_secret>
    GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback
    
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_USER=<your_email_address>
    EMAIL_PASS=<your_email_app_password>
    NODE_ENV=development
    ```

3.  **Frontend Setup**
    Navigate to the frontend directory and install dependencies:
    ```bash
    cd ../frontend
    npm install
    ```

    Create a `.env` file in the `frontend` directory:
    ```env
    VITE_API_URL=http://localhost:4000
    ```

## Usage

1.  **Start the Backend Server**
    In the `backend` directory:
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:4000`.

2.  **Start the Frontend Development Server**
    In the `frontend` directory:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

## Folder Structure

```
HackVerse/
├── backend/                # Node.js/Express Backend
│   ├── config/             # DB and service configurations
│   ├── controllers/        # Route logic and controllers
│   ├── middleware/         # Custom middleware (auth, upload, etc.)
│   ├── models/             # Mongoose database models
│   ├── routes/             # API routes
│   └── ...
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── content/        # Static content/assets
│   │   ├── context/        # React Context providers
│   │   ├── pages/          # Application pages (views)
│   │   └── ...
│   └── ...
└── ...
```

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is open-source and available under the [ISC License](LICENSE).
