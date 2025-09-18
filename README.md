# 💰 Finetech Expense Tracker (Full Stack Project)

An advanced **Expense Tracker Application** built during the CSI Hackathon for the Full Stack role.  
The project helps users efficiently **track expenses, transfers, and alerts**, while providing an intuitive dashboard, AI-powered insights, and automated reports.  

---

## 🚀 Features
- 🔐 **User Authentication** (JWT, bcrypt, token-based login/logout)  
- 📊 **Dashboard** – Real-time spending overview  
- 🧾 **Transactions** – Add, update, delete, and view expenses  
- 🔄 **Transfers** – Send/receive money between users  
- 🚨 **Alerts & Notifications** – Spending limit alerts, large transaction warnings  
- ⚙️ **Customizable Alert Settings** (daily, weekly, monthly limits)  
- 📧 **Email Reports** – Monthly reports with attached images (via Nodemailer)  
- 🤖 **AI-Powered Insights** – Analyze spending behavior using **Google Gemini API**  
- 🎨 **Modern UI/UX** with responsive design  

---

## 🏗️ Architecture
This project follows a **Full Stack MERN (MongoDB, Express, React, Node.js)** architecture.  

**Frontend (React.js)**  
- React + React Router DOM for navigation  
- Context API for authentication state  
- Axios with interceptors for API communication  
- TailwindCSS + custom CSS for styling  

**Backend (Node.js + Express.js)**  
- RESTful API endpoints  
- MongoDB + Mongoose ODM for data storage  
- JWT authentication  
- Bcrypt password hashing  
- Alert logic & spending statistics  
- **Nodemailer** for email alerts/reports  
- **Gemini API** for expense analysis  

---

## 📂 Tech Stack
- **Frontend:** React, Axios, TailwindCSS, React Router  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB with Mongoose  
- **Authentication:** JWT + bcrypt  
- **Email Service:** Nodemailer (with attachments support)  
- **AI Integration:** Google Gemini API (financial insights)  
- **Version Control:** GitHub  

---

## ⚙️ Installation & Setup

### 🔧 Backend
```bash
# Clone the repo
git clone <your-repo-url>
cd expense-tracker/backend

# Install dependencies
npm install

# Setup environment variables
# Create a .env file with:
# MONGO_URI=<your-mongo-db-uri>
# JWT_SECRET=<your-secret-key>
# GEMINI_API_KEY=<your-gemini-api-key>
# EMAIL_USER=<your-email-address>
# EMAIL_PASS=<your-email-password>
# PORT=5000

# Run server
npm run dev

Frontend
cd expense-tracker

# Install dependencies
npm install

# Start development server
npm run dev

📧 Nodemailer (Email Service)

Sends monthly expense reports to users.

Can attach images/charts for better visualization.

Uses Gmail/SMTP or custom email service.

🤖 Gemini API (AI Insights)

Integrated with Google Gemini API.

Provides personalized spending analysis.

Example: "You spent most on Food this month. Try reducing dine-out expenses."

📌 Expected Benefits

Better financial awareness.

AI-powered suggestions for smarter savings.

Easy-to-read reports via email.

Secure and user-friendly interface.

📝 Author

Arshdeep Singh
CSI ID: CT_CSI_RJ_5475
