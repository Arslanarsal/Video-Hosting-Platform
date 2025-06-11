
```markdown
# 🎥 Video Hosting Platform - Backend

A scalable, modular backend for a **Video Hosting Platform** built with **Node.js**, **Express.js**, and **MongoDB**. This project follows **industry-standard** architecture, focusing on clean code, maintainability, and real-world production practices.

---

## 📌 Key Features

- 🔐 JWT-based **Authentication & Authorization**
- 🎞️ **Video Upload, Stream, View Count**
- 💬 **Comments**, 👍 **Likes**, 👎 **Dislikes**
- 🧵 **Tweets-like Updates**
- 📁 **User-Created Playlists**
- 📺 **User Subscriptions & Channels**
- 📊 **Video Analytics Support Ready**
- 🧰 **Modular MVC Folder Structure**

---

## 🧠 Database Schema (MongoDB - Mongoose)

The backend revolves around **8 main collections**:

| Collection     | Description |
|----------------|-------------|
| `users`        | Stores user data including auth, profile, and watch history |
| `videos`       | Video metadata: file paths, titles, views, and ownership |
| `comments`     | Comments linked to videos and users |
| `likes`        | Tracks likes on comments, tweets, and videos |
| `tweets`       | Short text updates by users (optional social feature) |
| `subscriptions`| Records who follows whom |
| `playlists`    | Custom user playlists referencing multiple videos |

### 🧬 Relationships Summary

- A **user** can upload many **videos**, create many **playlists**, **tweets**, **comments**, and **likes**
- A **video** can have many **comments**, **likes**, and be in multiple **playlists**
- **Comments** are liked via the `likes` collection (using `comment` and `likedBy` fields)
- **Subscriptions** link a `subscriber` to a `channel` (both users)
- **Playlists** store an array of video ObjectIds and reference the `owner`

![ERD](./diagram-export-6-11-2025-3_50_25-PM.png)

---

## 🛠️ Tech Stack

| Tech         | Role                   |
|--------------|------------------------|
| Node.js      | Backend runtime        |
| Express.js   | Web framework          |
| MongoDB      | NoSQL database         |
| Mongoose     | ODM for MongoDB        |
| JWT          | User authentication    |
| Multer       | File upload middleware |
| Bcrypt       | Password hashing       |

---

## 🗂️ Folder Structure

```

📦 video-hosting-backend/
├── 📂 config/         # DB and ENV setup
├── 📂 controllers/    # Business logic
├── 📂 middlewares/    # Auth, error handling, validators
├── 📂 models/         # Mongoose schemas
├── 📂 routes/         # API routes
├── 📂 utils/          # Reusable helpers
├── 📄 server.js       # Entry point
├── 📄 .env

````

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/video-hosting-backend.git
cd video-hosting-backend
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Create `.env` File

```env
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret_key
```

### 4. Run the Server

```bash
npm run dev
```

---

## 📣 API Overview

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| POST   | `/api/auth/register` | Register user            |
| POST   | `/api/auth/login`    | Login user               |
| POST   | `/api/videos`        | Upload video             |
| GET    | `/api/videos/:id`    | Get video stream/details |
| POST   | `/api/comments`      | Comment on video         |
| POST   | `/api/likes`         | Like comment/tweet/video |
| GET    | `/api/playlists`     | Get user playlists       |
| POST   | `/api/subscriptions` | Subscribe to a channel   |

---

## 👨‍💻 Author

**Muhammad Arslan**
🔗 [LinkedIn Profile](https://www.linkedin.com/in/m-arslan-aa21a0246)
📧 [arslanarsal455@gmail.com](mailto:arslanarsal455@gmail.com)



PRs and issues are welcome! Follow conventional commits and maintain code modularity for smooth merging.

