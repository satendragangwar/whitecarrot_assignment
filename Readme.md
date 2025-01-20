# **Google Calendar Integration**

This project demonstrates the integration of Google Calendar with a web application using the MERN stack (Frontend and Backend). It allows users to authenticate using their Google account, access their calendar in real-time, and manage events directly from the application. The updates are reflected both in the application UI and the user's Google Calendar.

---

## **Features**

- **Google OAuth 2.0** login functionality for secure user authentication.
- Fetch and display events from the user's Google Calendar in a user-friendly table format.
- **Event Management**:
  - Add, edit, and delete events directly from the application, with changes reflected in the Google Calendar in real-time.
- **Export Options**:
  - Download events as **PDF** or **CSV** files.
- **Insights**:
  - View detailed insights and statistics about your events.

---

## **Authentication Flow**

1. **Login**:
   - Users log in using Google OAuth 2.0.
   - After granting permissions, users are redirected back to the application with an authorization code.

2. **Token Exchange**:
   - The server exchanges the authorization code for access and refresh tokens.
   - Tokens are used to authenticate API requests to Google Calendar.

3. **User Information**:
   - The server verifies the ID token and retrieves user information.
   - User details are stored in the database for session management.

---

## **Technologies Used**

- **React.js**: Frontend library for building user interfaces.
- **Node.js**: Backend runtime environment for executing JavaScript code.
- **Express.js**: Web framework for building backend APIs.
- **MongoDB**: NoSQL database for storing user and event information.
- **Vanilla CSS**: For styling the application.
- **React Router**: For navigation and routing within the React application.

---

## **Getting Started**

- First clone the repository --
  ``git clone https://github.com/satendragangwar/whitecarrot_assignment.git``
- cd backend-calendar/
     `npm i and npm start`
- cd frontend-calendar/
    `npm i and npm run dev`

## **Environment variables**

```
MONGO_URI=<Your MongoDB Connection String> 
PORT=3000
GOOGLE_CLIENT_ID=<Your Google OAuth 2.0 Client ID>
GOOGLE_CLIENT_SECRET=<Your Google OAuth 2.0 Client Secret>
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```


