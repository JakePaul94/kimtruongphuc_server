---

### 2. File `README.md` cho Backend (`kimtruongphuc_server`)

```markdown
# 🛠️ Kim Truong Phuc - Equipment Management API (Server)

[![NodeJS](https://img.shields.io/badge/Backend-Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![ExpressJS](https://img.shields.io/badge/Framework-Express.js-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=json-web-tokens&logoColor=white)](https://jwt.io/)

> Scalable RESTful API powering the Kim Truong Phuc Equipment & Asset Management System.

🔗 **Frontend Repository:** [kimtruongphuc](https://github.com/JakePaul94/kimtruongphuc)

---

## 📌 Overview

The **kimtruongphuc_server** provides a secure, robust backend architecture responsible for data persistence, authentication, role-based authorization, and business logic for industrial device management.

---

## ✨ Key Features

- 🔐 **Authentication & Authorization:** Secure user login via JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).
- 📦 **Asset & Equipment CRUD:** Complete API endpoints to register, update, inspect, and retire equipment.
- 📋 **Maintenance Logs:** Track service history, replacement parts, and technician assignments.
- 🛡️ **Data Validation & Error Handling:** Centralized error handling and input sanitization to ensure data integrity.
- 📁 **File Uploads:** Support for attaching technical documents, manuals, and inspection photos.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **Security & Utilities:** `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`
- **File Storage:** Multer (Local/Cloudinary)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/JakePaul94/kimtruongphuc_server.git
   cd kimtruongphuc_server
