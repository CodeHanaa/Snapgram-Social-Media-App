# Snapgram-Social-Media-App
A modern full-stack social media application inspired by Instagram, built with React, Appwrite, and Tailwind CSS.
Snapgram focuses on delivering a fast, responsive, and native-app-like user experience with real-world production patterns such as caching, infinite scrolling, and modular architecture.

🚀 Live Demo ف مرحله الانشاء 

📌 About The Project
Snapgram is a feature-rich social media platform that allows users to:
Create an account and authenticate securely
Create, edit, like, and save posts
Upload images and media files
Explore posts using infinite scrolling
Search for users and content
View detailed user profiles
The project is designed to simulate real-world production applications using modern frontend architecture and Backend-as-a-Service (BaaS).

✨ Features
🔐 Authentication System (Sign up / Login / Logout)
📝 Post Management (Create, Edit, Delete posts)
❤️ Like & Save System
🔍 Search Functionality with Debounce Optimization
♾️ Infinite Scroll Feed
📤 File Upload System (Images)
👤 User Profiles with Activity Overview
⚡ Optimized Data Fetching with React Query
📱 Fully Responsive Design (Mobile-first)

🛠️ Tech Stack
Frontend
React.js
TypeScript
Tailwind CSS
State Management / Data Fetching
TanStack Query (React Query)
Backend (BaaS)
Appwrite (Authentication, Database, Storage)
Tools & Libraries
React Router DOM
React Dropzone
Lucide Icons

📁 Project Structure
src/
 ├── components/        # Reusable UI components
 ├── pages/             # App pages (Home, Profile, Explore)
 ├── hooks/             # Custom hooks (useDebounce, etc.)
 ├── lib/               # Appwrite config & API services
 ├── context/           # Global state (if used)
 ├── styles/            # Global styles
 └── utils/             # Helper functions


⚙️ Installation & Setup
1. Clone the repository
git clone https://github.com/your-username/snapgram.git
cd snapgram

2. Install dependencies
npm install

3. Install additional packages (if needed)
npm install @tanstack/react-query react-router-dom lucide-react appwrite react-dropzone react-intersection-observer

4. Setup environment variables
Create a .env.local file in the root directory:
VITE_APPWRITE_URL=your_appwrite_url
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_STORAGE_ID=your_storage_id
VITE_APPWRITE_USER_COLLECTION_ID=your_user_collection_id
VITE_APPWRITE_POST_COLLECTION_ID=your_post_collection_id
VITE_APPWRITE_SAVES_COLLECTION_ID=your_saves_collection_id


▶️ Run the Project
npm run dev

Then open:
http://localhost:5173


🧠 Key Concepts Implemented
🔄 React Query Optimization
Used for:
Caching API requests
Background refetching
Reducing unnecessary re-renders
♾️ Infinite Scrolling
Implemented using intersection observer to load posts dynamically.
🔐 Appwrite Integration
Handles:
Authentication
Database operations
File storage
🔍 Debounced Search
Prevents excessive API calls and improves performance.

🚧 Challenges Faced
Managing global state between posts and user interactions
Optimizing API calls for better performance
Handling file uploads and storage synchronization
Structuring scalable frontend architecture

📈 Future Improvements
🌙 Dark mode support
💬 Comment system
🔔 Notifications system
📊 Analytics dashboard for user activity
🧑‍🤝‍🧑 Follow / Unfollow system
⚡ Better error handling & skeleton loaders

🧑‍💻 Author
Frontend Developer: [Hanaa Nagy]
Passionate about building scalable and interactive web applications using modern frontend technologies.
