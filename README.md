# 🎓 CampusFeed

A full-stack campus social platform that lets students share posts, report lost & found items, and interact with an AI assistant — all in one place.

---

## 📸 Features

- 🗞️ **Campus Feed** — Create, like, and comment on posts with support for image/video uploads
- 🔍 **Lost & Found** — Report lost or found items with image support
- 🤖 **AI Assistant** — Integrated Google Gemini AI for smart campus queries
- 👤 **User Profiles** — Manage your profile with a custom profile picture
- 🔐 **Authentication** — Secure JWT-based register/login system
- 🛡️ **Protected Routes** — Certain pages are accessible only to logged-in users

---

## 🧱 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Build tool & dev server |
| React Router DOM v7 | Client-side routing |
| Tailwind CSS v4 | Styling |
| Axios | HTTP client |
| React Toastify | Notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| Cloudinary + Multer | Media upload & storage |
| Google Gemini AI | AI assistant integration |
| dotenv | Environment config |

---

## 📁 Project Structure

```
CampusFeed/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route logic
│   ├── middleware/      # Auth & request middleware
│   ├── models/          # Mongoose schemas (User, Feed, LostItem)
│   ├── routes/          # API route definitions
│   │   ├── auth.js
│   │   ├── Feeds.js
│   │   ├── lostItems.js
│   │   ├── profile.js
│   │   └── aiinput.js
│   └── server.js        # App entry point
│
└── frontend/
    ├── public/
    └── src/
        ├── components/  # Navbar, ProtectedRoute, etc.
        ├── context/     # Global auth context
        ├── pages/       # Home, AddFeed, Items, Login, Register, Profile
        ├── App.jsx      # Route definitions
        └── main.jsx     # React entry point
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Cloudinary](https://cloudinary.com/) account
- [Google Gemini API Key](https://ai.google.dev/)

---

### 🔧 Backend Setup

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the `backend/` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/campusfeed
   JWT_SECRET=your_jwt_secret_key
   PORT=5000

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The backend runs on `http://localhost:5000`

---

### 🎨 Frontend Setup

1. **Navigate to the frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:5173`

---

## 🛣️ API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/auth/register` | Register a new user | ❌ |
| `POST` | `/auth/login` | Login and get JWT token | ❌ |
| `GET` | `/api/feeds` | Get all feed posts | ❌ |
| `POST` | `/api/feeds` | Create a new post | ✅ |
| `POST` | `/api/feeds/:id/like` | Like / unlike a post | ✅ |
| `POST` | `/api/feeds/:id/comment` | Comment on a post | ✅ |
| `GET` | `/api/lostitems` | Get all lost & found items | ❌ |
| `POST` | `/api/lostitems` | Report a lost/found item | ✅ |
| `GET` | `/profile` | Get user profile | ✅ |
| `PUT` | `/profile` | Update user profile | ✅ |
| `POST` | `/api/ai` | Send a query to Gemini AI | ✅ |

---

## 📄 Pages Overview

| Route | Page | Access |
|-------|------|--------|
| `/` | Home Feed | Public |
| `/register` | Register | Public |
| `/login` | Login | Public |
| `/items` | Lost & Found | Public |
| `/AddFeed` | Create Post | 🔒 Protected |
| `/profile` | User Profile | 🔒 Protected |

---

## 🔒 Environment Variables

> ⚠️ **Never commit your `.env` files to version control.** Both `backend/.env` and `frontend/.env` are already listed in `.gitignore`.

| Variable | Where | Description |
|----------|-------|-------------|
| `MONGO_URI` | backend | MongoDB connection string |
| `JWT_SECRET` | backend | Secret key for signing JWTs |
| `PORT` | backend | Server port (default: 5000) |
| `CLOUDINARY_CLOUD_NAME` | backend | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | backend | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | backend | Cloudinary API secret |
| `GEMINI_API_KEY` | backend | Google Gemini AI API key |
| `VITE_API_URL` | frontend | Backend base URL |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).

---

> Built with ❤️ for the campus community.
