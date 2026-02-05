# 🌿 LeafLine

**LeafLine** is a comprehensive full-stack gardening platform that empowers plant enthusiasts to manage their gardens with ease. Explore thousands of plant guides, track care schedules, share experiences through blogs and gallery, and build your personalized plant collection—all in one beautiful, intuitive application.

## 🚀 Project Type
Full-Stack Web Application (MERN Stack)

## 🛠 Tech Stack

### Frontend
- **React.js** v19.1.1
- **Vite** v7.1.2
- **Tailwind CSS** v4.1.12
- **React Router** v7.8.2
- **Chakra UI** + **Framer Motion** (animations)

### Backend
- **Node.js** + **Express.js** v5.2.1
- **MongoDB** (Mongoose v8.19.2)
- **JWT Authentication** (jsonwebtoken)
- **Security**: Helmet, CORS, Rate Limiting, bcryptjs

### Database
- **MongoDB** (Cloud: MongoDB Atlas)

## ✨ Main Features
- 🌱 **Plant Care & Guides** – Comprehensive plant care instructions
- 📚 **Plant Database** – Browse 1000+ plants with care details
- 📅 **Dynamic Plant Calendar** – Track watering & maintenance schedules
- 📝 **Blogs Section** – Community gardening tips and articles
- 🖼 **Garden Gallery** – Share and view garden photos
- 👤 **User Profiles** – Personal plant collection management
- 🔐 **Authentication** – Secure JWT-based auth

## 📂 Project Structure

```
LeafLine/
├── backend/
│   ├── controller/          # Route controllers
│   ├── middleware/          # Auth & security middleware
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   ├── services/            # External API integrations
│   ├── utils/               # Helper functions
│   ├── seed/                # Database seeding
│   ├── data/                # Plant data JSON
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── server.js            # Entry point
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── api/             # API integration files
│   │   ├── auth/            # Auth context
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # Frontend services
│   │   ├── assets/          # Images & resources
│   │   └── App.jsx
│   ├── .env                 # Frontend env variables
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v14+) installed
- MongoDB Atlas account (or local MongoDB)
- npm or yarn package manager

### Backend Setup

```bash
cd backend
npm install

# Create .env file with:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
# PORT=5000
# JWT_SECRET=your_secret_key_here
# PERENUAL_KEY=your_api_key
# PLANT_ID_API_KEY=your_api_key
# TREFLE_API_KEY=your_api_key

npm start          # Production mode
npm run dev        # Development (uses nodemon)
npm run seed       # Seed plant care database
```

**Backend runs on:** `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file with:
# VITE_API_BASE_URL=http://localhost:5000/api
# REN_URL=https://your-render-url.com/ (for production)

npm run dev        # Development server (Vite)
npm run build      # Production build
npm run preview    # Preview built version
npm run lint       # Run ESLint
```

**Frontend runs on:** `http://localhost:5173` (Vite default)

## 🔌 API Endpoints

### Users
- `POST /api/users/register` – User registration
- `POST /api/users/login` – User login

### Plants
- `GET /api/user-plants` – Get user's plants
- `POST /api/user-plants` – Add plant to collection
- `DELETE /api/user-plants/:id` – Delete plant
- `PUT /api/user-plants/:id` – Update plant care

### Gallery
- `GET /api/gallery` – Get gallery posts
- `POST /api/gallery` – Upload photo
- `DELETE /api/gallery/:id` – Delete photo

### Calendar
- `GET /api/calendar` – Get schedules
- `POST /api/calendar` – Create schedule
- `PUT /api/calendar/:id` – Update schedule

### Blogs & Stories
- `GET /api/blogs` – Get blogs
- `POST /api/blogs` – Create blog
- `GET /api/stories` – Get stories
- `POST /api/stories` – Create story

## 🚀 Deployment

### Backend (Render)
### Frontend (Netlify)

## 📝 Usage

Users can:
1. **Register/Login** – Create an account
2. **Explore Plants** – Search 1000+ plants with care guides
3. **Manage Collection** – Add plants and track care schedules
4. **View Calendar** – Track watering & maintenance dates
5. **Read Blogs** – Learn gardening tips from community
6. **Share Gallery** – Upload and view garden photos
7. **Create Stories** – Share gardening experiences

## 📄 License
ISC

## 👨‍💻 Author
Ankit

---

**Happy Gardening! 🌿**
