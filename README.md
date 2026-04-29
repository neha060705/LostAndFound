# Lost & Found Item Management System

A full-stack MERN application for reporting and tracking lost and found items.
Frontend Render Link: https://lostandfound-2-dol4.onrender.com
Backend Render Link: https://lostandfound-mmvk.onrender.com


## Features

- 🔐 User Registration & Login with JWT Authentication
- 📋 Report Lost/Found items with full details
- 🔍 Search items by name or category (Lost/Found)
- ✏️ Update your own item reports
- 🗑️ Delete your own item reports
- 📊 Dashboard with statistics
- 🔒 Protected routes — only logged-in users can access the dashboard

## Tech Stack

- **Frontend**: React (Vite), React Router, Axios, Vanilla CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: bcryptjs (password hashing), JSON Web Tokens (JWT)

## Project Structure

```
LostAndFound/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Item.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── items.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Register.jsx
    │   │   ├── Login.jsx
    │   │   └── Dashboard.jsx
    │   ├── api.js
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017)

### Backend Setup

```bash
cd backend
npm install
# Edit .env to set MONGO_URI, JWT_SECRET, PORT
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`  
Frontend runs on `http://localhost:5173`

## API Endpoints

### Auth Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/register | Register new user |
| POST | /api/login | Login user |

### Item Routes (Protected — Requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/items | Add new item |
| GET | /api/items | Get all items |
| GET | /api/items/:id | Get item by ID |
| PUT | /api/items/:id | Update item (owner only) |
| DELETE | /api/items/:id | Delete item (owner only) |
| GET | /api/items/search?name=xyz | Search items |

## Deployment

- **Backend**: Deployed on [Render](https://render.com)
- **Frontend**: Deployed on [Render](https://render.com) (static site)
- **Database**: MongoDB Atlas

### Deployment Links
- Backend: `<add your render backend URL>`
- Frontend: `<add your render frontend URL>`

## MongoDB Schema

### User
```js
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed with bcrypt)
}
```

### Item
```js
{
  itemName: String (required),
  description: String (required),
  type: "Lost" | "Found" (required),
  location: String (required),
  date: Date (required),
  contactInfo: String (required),
  postedBy: ObjectId (ref: User)
}
```
