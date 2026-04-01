# 🌐 SocialHub — Mini Social Post App

> **W3 Full Stack Internship Assignment — Task 1**
> A full-stack social media platform inspired by TaskPlanet's Social Feed.

---

## ✨ Features

- 🔐 **Authentication** — Signup & Login with JWT (email + password)
- ✍️ **Create Posts** — Share text, image, or both (at least one required)
- 📰 **Public Feed** — See all posts sorted by Newest / Most Liked / Most Commented
- ❤️ **Like Posts** — Toggle likes with instant updates; tracks who liked
- 💬 **Comments** — Add/delete inline comments with real-time updates
- 👤 **User Profiles** — View any user's profile with their posts + stats
- 👥 **Follow System** — Follow/unfollow other users
- 🔍 **Search** — Client-side search for posts and users
- 📄 **Pagination** — Efficient page-based pagination with "Load More"
- 🌙 **Dark Mode** — Premium dark theme inspired by TaskPlanet social feed

---

## 🛠️ Tech Stack

| Layer       | Technology                           |
| ----------- | ------------------------------------ |
| Frontend    | React.js, Material UI (MUI), Axios   |
| Backend     | Node.js, Express.js                  |
| Database    | MongoDB Atlas (Mongoose ODM)         |
| Auth        | JWT (JSON Web Tokens) + bcryptjs     |
| File Upload | Multer (local storage)               |
| Hosting     | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
W3-Assignment/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema (email, username, password hash)
│   │   └── Post.js          # Post schema (text, image, likes, comments)
│   ├── routes/
│   │   ├── auth.js          # POST /register, POST /login, GET /me
│   │   ├── posts.js         # CRUD + like/comment actions
│   │   └── users.js         # Profile + follow/unfollow
│   ├── middleware/
│   │   ├── auth.js          # JWT protect middleware
│   │   └── upload.js        # Multer image upload config
│   ├── uploads/             # Local image storage
│   ├── server.js            # Express app entry point
│   └── .env.example         # Environment variable template
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── index.js     # Axios client + all API functions
    │   ├── context/
    │   │   └── AuthContext.js # Global auth state with session restore
    │   ├── components/
    │   │   ├── Navbar.js    # Sticky navbar with user menu
    │   │   ├── PostCard.js  # Post with like/comment/delete
    │   │   ├── CreatePost.js # Post composer with image upload
    │   │   └── LoadingScreen.js
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── FeedPage.js  # Main social feed
    │   │   └── ProfilePage.js
    │   ├── App.js           # Routes + MUI theme
    │   └── index.js         # Entry point
    └── public/
        └── index.html
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js ≥ 18
- MongoDB Atlas account (free tier)
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/w3-social-app.git
cd w3-social-app
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/socialapp
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000
```

Start backend:

```bash
npm run dev       # development (nodemon)
npm start         # production
```

Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SERVER_URL=http://localhost:5000
```

Start frontend:

```bash
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🗄️ MongoDB Collections

Only **2 collections** used (as per guidelines):

### `users`

```json
{
  "_id": "ObjectId",
  "username": "john_doe",
  "email": "john@example.com",
  "password": "<bcrypt_hash>",
  "avatar": "",
  "bio": "",
  "following": ["ObjectId"],
  "followers": ["ObjectId"],
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### `posts`

```json
{
  "_id": "ObjectId",
  "user": "ObjectId",
  "username": "john_doe",
  "avatar": "",
  "text": "Hello world!",
  "image": "https://...",
  "likes": ["ObjectId"],
  "likedByUsernames": ["jane_doe"],
  "comments": [
    {
      "_id": "ObjectId",
      "user": "ObjectId",
      "username": "jane_doe",
      "text": "Great post!",
      "createdAt": "ISODate"
    }
  ],
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

---

## 🌐 API Endpoints

### Auth

| Method | Endpoint           | Description      | Auth |
| ------ | ------------------ | ---------------- | ---- |
| POST   | /api/auth/register | Create account   | ❌   |
| POST   | /api/auth/login    | Login            | ❌   |
| GET    | /api/auth/me       | Get current user | ✅   |

### Posts

| Method | Endpoint                    | Description          | Auth |
| ------ | --------------------------- | -------------------- | ---- |
| GET    | /api/posts                  | Get feed (paginated) | ❌   |
| POST   | /api/posts                  | Create post          | ✅   |
| PUT    | /api/posts/:id/like         | Toggle like          | ✅   |
| POST   | /api/posts/:id/comment      | Add comment          | ✅   |
| DELETE | /api/posts/:id              | Delete post          | ✅   |
| DELETE | /api/posts/:id/comment/:cid | Delete comment       | ✅   |

### Users

| Method | Endpoint              | Description        | Auth |
| ------ | --------------------- | ------------------ | ---- |
| GET    | /api/users/:username  | Get public profile | ❌   |
| PUT    | /api/users/:id/follow | Follow/unfollow    | ✅   |

---

## 🚀 Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set `REACT_APP_API_URL` to your Render backend URL
4. Deploy!

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo → select `backend/` folder
3. Set environment variables (MONGO_URI, JWT_SECRET, CLIENT_URL)
4. Build Command: `npm install` | Start Command: `node server.js`

### Database → MongoDB Atlas

1. Create free cluster at [mongodb.com/atlas](https://cloud.mongodb.com)
2. Create a database user with Read/Write permissions
3. Whitelist IP `0.0.0.0/0` for Render
4. Copy the connection string to your `MONGO_URI`

---

## 🏆 Bonus Features Implemented

- ✅ Clean, modern dark UI inspired by TaskPlanet
- ✅ Responsive layout for all screen sizes
- ✅ Pagination with "Load More" button
- ✅ Sorting: Newest / Most Liked / Most Commented
- ✅ Optimistic UI updates for likes
- ✅ Follow/unfollow system with follower counts
- ✅ User profile pages with stats
- ✅ Client-side search for posts & users
- ✅ Well-structured, modular code with comments

---

## 👨‍💻 Author

Built for **W3 Full Stack Internship — Round 1 Assignment**
