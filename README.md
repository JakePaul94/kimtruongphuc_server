# 🏭 Kim Truong Phuc - Industrial Boiler & Facility Management API

[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NodeJS](https://img.shields.io/badge/Runtime-Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![ExpressJS](https://img.shields.io/badge/Framework-Express.js-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![SQL](https://img.shields.io/badge/Database-SQL%20(Relational)-CC292B?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20Refresh%20Token-black?style=flat&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Multer](https://img.shields.io/badge/Upload-Multer-orange?style=flat)](https://github.com/expressjs/multer)

> Enterprise RESTful API built with **Node.js, Express, TypeScript, and SQL** for end-to-end monitoring, maintenance lifecycle management, and incident resolution for industrial boiler systems at Kim Truong Phuc Energy.

🔗 **Frontend Repository:** [kimtruongphuc (React Client)](https://github.com/JakePaul94/kimtruongphuc)

---

## 📌 Domain Overview

Boiler systems and high-pressure steam equipment require strict maintenance standards, water quality tracking, and rapid incident resolution. This backend provides a unified management platform that connects **Plant Managers**, **Engineers**, and **On-site Technicians** to ensure plant safety, decrease downtime, and track compliance.

---

## 🚀 Core Modules & Capabilities

1. 🔐 **Authentication & Security:** 
   - JWT Access Token & Refresh Token mechanism with auto-login support.
   - Granular Role-Based Access Control (`requireRole('admin')`, manager, operator).

2. 🏭 **Boiler & Equipment Hierarchy:**
   - Multi-boiler management with technician assignments.
   - Nested Device & Sub-device tracking with attached technical documentation.
   - Filter devices scoped by assigned operator (`/for-my-boiler`).

3. 📋 **5-Tier Task Execution Engine:**
   - **Preventative Maintenance:** Reusable task templates & scheduled work orders.
   - **Periodic Inspection:** Equipment safety inspection routines.
   - **Boiler Cleaning (Vệ sinh lò):** Step-by-step location completion with photographic evidence.
   - **Water Quality Testing (Water Report):** Specialized chemical and water analysis test items with sample photo validation.
   - **Ad-hoc Tasks:** On-demand task assignment, real-time status tracking, and work logging.

4. 🚨 **Incident & Anomaly Reporting:**
   - Multi-image upload (up to 10 photos per report) for field failure diagnostics and status workflow.

5. 🔍 **On-Site QR Scanner:**
   - Dedicated endpoint for scanning machinery QR codes for immediate spec lookup and maintenance logs.

---

## 📑 Complete API Reference

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | User login (returns access & refresh token) | No |
| `POST` | `/api/auth/autologin` | Validate token & auto sign-in | No |
| `POST` | `/api/auth/logout` | Revoke session / clear tokens | No |
| `POST` | `/api/auth/refresh-token` | Generate new access token | No |
| `POST` | `/api/auth/change-password` | Update current user's password | ✅ Yes |

### 2. User Administration (`/api/users`)
| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/api/users/` | Get list of all staff members | `admin` |
| `GET` | `/api/users/:id` | Get user details by ID | `admin` |
| `POST` | `/api/users/create` | Register a new user | `admin` |

### 3. Boiler Operations (`/api/boilers`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/boilers/` | Get all boiler units |
| `POST` | `/api/boilers/create` | Register a new boiler facility |
| `GET` / `PUT` / `DELETE` | `/api/boilers/:id` | Read, update, or remove a boiler unit |
| `POST` | `/api/boilers/assign-user` | Assign operator/technician to a boiler |
| `DELETE` | `/api/boilers/:boilerId/users/:userId` | Unassign operator from boiler |
| `POST` | `/api/boilers/assign-device` | Attach existing device to a boiler |
| `POST` | `/api/boilers/:boilerId/devices` | Create and bind device directly to boiler |
| `GET` | `/api/boilers/:boilerId/devices` | List all devices belonging to a boiler |

### 4. Device & Component Management (`/api/devices`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/devices/` | Retrieve all registered devices |
| `POST` | `/api/devices/create` | Register new equipment |
| `GET` / `PUT` / `DELETE` | `/api/devices/:id` | Manage specific device data |
| `GET` | `/api/devices/:id/sub-devices` | Retrieve child/sub-components of an asset |
| `GET` | `/api/devices/:id/maintenance-tasks` | History of maintenance work orders |
| `GET` | `/api/devices/:id/inspection-tasks` | Safety & inspection records |
| `GET` | `/api/devices/:id/documents` | Access device manuals & blueprints |
| `GET` | `/api/devices/for-my-boiler` | Fetch devices for current user's boilers |

### 5. Task & Operational Systems

#### A. Boiler Cleaning (`/api/cleaning`)
- `GET/POST/PUT/DELETE` `/api/cleaning/templates` - Manage reusable cleaning templates *(Admin only for creation)*.
- `GET` `/api/cleaning/tasks/my-boilers/available` - Unassigned cleaning tasks for managed boilers.
- `GET` `/api/cleaning/tasks/assigned/me` - Cleaning tasks assigned to current technician.
- `PUT` `/api/cleaning/tasks/:id/accept` - Claim/Accept an available cleaning job.
- `PUT` `/api/cleaning/tasks/locations/:locationId/complete` - Mark a specific boiler compartment/location as cleaned.

#### B. Water Quality Testing (`/api/water-report`)
- `GET/POST/PUT/DELETE` `/api/water-report/templates` - Water inspection criteria templates.
- `GET` `/api/water-report/tasks/my-boilers/available` - Available test orders.
- `PUT` `/api/water-report/tasks/:taskId/accept` - Claim testing task.
- `PUT` `/api/water-report/tasks/items/:itemId/complete` - Submit chemical analysis result with photographic evidence (`reportImage`).

#### C. Preventative Maintenance & Inspection (`/api/maintenance` & `/api/inspection`)
- `GET/POST/PUT/DELETE` `/templates` - Task blueprint management.
- `GET` `/tasks/:boilerId?date=YYYY-MM-DD` - Work schedules by boiler & date.
- `PUT` `/tasks/:id/status` - Transition work order status (Pending $\rightarrow$ In Progress $\rightarrow$ Done).

#### D. Ad-Hoc Tasks & Logging (`/api/ad-hoc`)
- `GET` `/boiler/:boilerId/tasks` & `/user/:userId/tasks` - Unscheduled tasks filterable by date.
- `POST` `/log` - Append real-time activity and timestamped notes to ongoing tasks.

### 6. Incidents, QR & Media
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/incidents/` | Submit incident report (Supports up to 10 photos) |
| `PUT` | `/api/incidents/:id/status`| Update status of reported failure |
| `POST` | `/api/img/scan-qr` | On-site QR code payload processor |
| `POST` | `/api/uploads/image` | Standalone asset image uploader |

---

## 🛠️ Project Structure

```text
kimtruongphuc_server/
├── src/
│   ├── controllers/            # Route controllers
│   │   ├── boilers/            # Boiler domain logic
│   │   ├── device/             # Equipment & incident controllers
│   │   ├── tasks/              # Cleaning, Water, Maintenance, Inspection controllers
│   │   ├── authController.ts
│   │   └── userController.ts
│   ├── middlewares/
│   │   ├── authMiddleware.ts   # JWT verification
│   │   ├── checkPermission.ts  # Permission verification
│   │   ├── requireRoleMiddleware.ts # Role enforcement (Admin, etc.)
│   │   └── multerConfig.ts     # Upload directories (avatars, incidents, water_reports)
│   ├── routes/                 # Express routing layer
│   │   ├── tasks/              # Specialized task sub-routers
│   │   ├── authRouter.ts
│   │   ├── boilerRouter.ts
│   │   ├── deviceRouter.ts
│   │   └── incidentReport.routes.ts
│   └── server.ts               # App entrypoint
├── tsconfig.json
├── package.json
└── README.md
