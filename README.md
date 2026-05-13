# Snapgram-Social-Media-App

A modern full-stack social media application inspired by Instagram, built with **React, Appwrite, and Tailwind CSS**.

Snapgram delivers a fast, responsive, and production-like experience using modern frontend architecture including caching, infinite scrolling, and modular design patterns.

---

## 🚀 Live Demo


```
تحت  الانشاء
```

---

## 📌 About The Project

Snapgram is a social media platform that allows users to:

* Create account and authenticate securely
* Create, edit, delete posts
* Like and save posts
* Upload images and media files
* Explore posts with infinite scrolling
* Search for users and content
* View user profiles with activity overview

The project simulates real-world production apps using **React + Appwrite (BaaS)**.

---

## ✨ Features

* 🔐 Authentication (Sign up / Login / Logout)
* 📝 Post CRUD (Create, Edit, Delete)
* ❤️ Like & Save system
* 🔍 Debounced search functionality
* ♾️ Infinite scrolling feed
* 📤 Image upload system
* 👤 User profiles
* ⚡ React Query caching & optimization
* 📱 Fully responsive design

---

## 🛠️ Tech Stack

### Frontend

* React.js
* TypeScript
* Tailwind CSS

### State & Data

* TanStack Query (React Query)

### Backend (BaaS)

* Appwrite (Auth, Database, Storage)

### Libraries

* React Router DOM
* React Dropzone
* Lucide Icons

---

## 📁 Project Structure

```
src/
 ├── components/   # Reusable UI components
 ├── pages/        # App pages (Home, Profile, Explore)
 ├── hooks/        # Custom hooks
 ├── lib/          # Appwrite config & API
 ├── context/      # Global state (if used)
 ├── styles/       # Global styles
 └── utils/        # Helper functions
```

---

## ⚙️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/CodeHanaa/Snapgram-Social-Media-App.git
cd Snapgram-Social-Media-App
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Required Packages

```bash
npm install @tanstack/react-query react-router-dom lucide-react appwrite react-dropzone react-intersection-observer
```

### 4. Environment Variables

Create `.env.local` file:

```env
VITE_APPWRITE_URL=your_appwrite_url
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_STORAGE_ID=your_storage_id
VITE_APPWRITE_USER_COLLECTION_ID=your_user_collection_id
VITE_APPWRITE_POST_COLLECTION_ID=your_post_collection_id
VITE_APPWRITE_SAVES_COLLECTION_ID=your_saves_collection_id
```

---

## ▶️ Run the Project

```bash
npm run dev
```

ثم افتح:

```
http://localhost:5173
```

---

## 🧠 Key Concepts Implemented

### 🔄 React Query Optimization

* Caching API requests
* Background refetching
* Performance optimization

### ♾️ Infinite Scroll

* Implemented using Intersection Observer

### 🔐 Appwrite Integration

* Authentication
* Database
* File storage

### 🔍 Debounced Search

* Reduces API calls
* Improves performance

---

## 🚧 Challenges Faced

* Managing global state across components
* Optimizing API performance
* Handling file uploads properly
* Structuring scalable frontend architecture

---

## 📈 Future Improvements

* 🌙 Dark mode
* 💬 Comments system
* 🔔 Notifications
* 📊 Analytics dashboard
* 🧑‍🤝‍🧑 Follow/Unfollow system
* ⚡ Skeleton loading & better UX

---

## 👩‍💻 Author

Frontend Developer: **[Hanaa Nagy]**

Focused on building scalable, high-performance web applications using modern frontend technologies.

