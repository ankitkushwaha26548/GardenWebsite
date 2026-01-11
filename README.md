# 🌿 LeafLine

LeafLine is a full-stack MERN gardening website designed for plant management.  
It helps users explore plant care guides, maintain plant records, and stay connected with nature digitally.

---

## 🚀 Project Type

Full-Stack Web Application (MERN Stack)

---

## 🛠 Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB

---

## ✨ Main Features

- 🌱 Plant Care & Guides  
- 📚 Plant Database  
- 📅 Dynamic Plant Calendar  
- 📝 Blogs Section  
- 🖼 Garden Gallery  

---

## 📂 Project Structure

```bash
LeafLine/
│
├── backend/
│   ├── controller/          # Controllers for handling API logic
│   ├── middleware/          # Middleware (auth, error handling)
│   ├── models/              # MongoDB models
│   ├── routes/              # Express routes
│   ├── seed/                # Seed data for DB
│   ├── .env                 # Environment variables
│   └── server.js            # Backend entry point
│
├── frontend/
│   ├── public/              # Public assets (index.html, images)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # React pages
│   │   ├── App.jsx          # Main App component
│   │   └── main.jsx         # React DOM entry point
│   └── vite.config.js       # Vite configuration
│
└── README.md

````
----

## ⚙️ Setup Instructions

### Backend Setup

```bash
cd backend
npm install
npm start


### frontend Setup

cd frontend
npm install
npm run dev

### Environment veriables(.env)

PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret

