# Frontend for Todo Auth App

This frontend connects to the backend API in the parent repository.

## Run locally

1. Start the backend:
   ```bash
   npm install
   npm start
   ```
2. Open the `frontend` folder in VS Code and use Live Server, or run a simple server:
   ```bash
   cd frontend
   npx serve .
   ```
3. Visit the served `index.html` in your browser.

## Backend URL

The frontend currently points to `http://localhost:4000`. If your backend is deployed, update `API_BASE_URL` in `frontend/app.js` to the deployed URL.

## Features

- Register user
- Login user
- Create todo
- Mark todo complete / undo
- Delete todo

## Notes

- Backend must be running and accessible from the frontend.
- CORS is enabled in the backend so the frontend can connect from another origin.
