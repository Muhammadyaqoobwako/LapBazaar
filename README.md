# 💻 LapBazaar - Laptop Marketplace & Repair Management System

LapBazaar is a full-stack web application that serves as a laptop marketplace and repair management platform. It enables admins, technicians, and local users to interact seamlessly for buying, selling, and repairing laptops.

---

## 🚀 Features

### 👨‍💼 Admin Panel
- Manage all users (technicians & customers)
- View & manage all listed laptops
- Approve or reject repair requests
- Analytics & reports

### 🧑‍🔧 Technician Portal
- View assigned repair requests
- Update repair status
- Profile management

### 👤 Local User Portal
- Sign up / Log in
- Browse laptops for sale
- Create repair requests
- Track repair progress
- Contact support

---

## 🧱 Tech Stack

### 🖥️ Frontend
- React.js (with React Router DOM)
- Redux Toolkit
- Axios
- CSS (Modular/Component based)
- Framer Motion / AOS for Animations

### 🌐 Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- REST APIs

---

## 📁 Folder Structure

```plaintext
lapbazaar/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/    # Navbar, Footer, Cards, etc.
│   │   ├── pages/         # Home, Services, About, Contact, NotFound, etc.
│   │   ├── redux/
│   │   └── App.js
│   └── public/
└── README.md
