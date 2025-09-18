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

## UI/UX
<img width="1273" height="922" alt="image" src="https://github.com/user-attachments/assets/13441eb8-721d-4d5d-8c3c-814785fb8232" />
<img width="1243" height="904" alt="image" src="https://github.com/user-attachments/assets/b5b83a5b-af2b-4da3-8e19-b754b6ac1b6c" />
<img width="1250" height="918" alt="image" src="https://github.com/user-attachments/assets/f0a790c7-8850-4d3e-bc3c-3c1dc349a11d" />
<img width="1233" height="926" alt="image" src="https://github.com/user-attachments/assets/d0e2f64b-183e-42d0-89dd-b50b1c81e218" />
<img width="1250" height="744" alt="image" src="https://github.com/user-attachments/assets/de232220-8614-4064-b883-dc3e0fe8e087" />
<img width="1276" height="825" alt="image" src="https://github.com/user-attachments/assets/2b211553-e3f2-42cf-b389-50ae8081b258" />
<img width="1249" height="923" alt="image" src="https://github.com/user-attachments/assets/e9296493-b9c0-4af3-b2ba-b9af5c9f0734" />







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

### 🔧 Backend
```bash
-cd expense-tracker

# Install dependencies
-npm install

# Start development server
-npm run dev

##📧 Nodemailer (Email Service)

-Sends monthly expense reports to users.

-Can attach images/charts for better visualization.

-Uses Gmail/SMTP or custom email service.

##🤖 Gemini API (AI Insights)

-Integrated with Google Gemini API.

-Provides personalized spending analysis.

-Example: "You spent most on Food this month. Try reducing dine-out expenses."

##📌 Expected Benefits

-Better financial awareness.

-AI-powered suggestions for smarter savings.

-Easy-to-read reports via email.

-Secure and user-friendly interface.

##📝 Author

-Arshdeep Singh
-CSI ID: CT_CSI_RJ_5475
