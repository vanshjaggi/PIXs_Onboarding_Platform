# PIXs Onboarding Platform

A simple frontend app built with **React + TypeScript (Vite)** for managing employee onboarding and e-sign processes at PIXs Technologies.

The app is fully frontend — no backend needed.  
All data and API calls are handled locally through a fake API (`ApiService.tsx`).

---

## 🚀 Features

- HR and employee dashboards  
- Manage onboarding requests and e-sign approvals  
- Role-based login  
- Clean, fast, and demo-ready UI  

---

## 🔧 Tech Stack

React · TypeScript · Vite · React Router · Context API · CSS

---

## ⚙️ Setup

1. Install [Node.js 18+](https://nodejs.org/)  
2. Open the project folder:
```bash
      cd "c:\Users\jaggi\OneDrive\Desktop\Onboarding_Platform"
```
3. Install dependencies:

   ```bash
   npm install
   ```
4. Start the dev server:

   ```bash
   npm run dev
   ```
5. Open your browser at:

   ```
   http://localhost:5173
   ```

---

## 🔐 Demo Login

| Role     | Email                                               | Password    |
| -------- | --------------------------------------------------- | ----------- |
| Employee | employee@company.com                                | password123 |
| HR Admin | hr@company.com                                      | password123 |
| New User | newuser@company.com                                 | password123 |

---

## 📁 Main Files

```
src/
├── App.tsx                    # App route : routing, Layout, ProtectedRoute and AppRoute Logic
├── main.tsx                   # Entry file
├── index.css                  # Global CSS imports
├── components/                # Holds all the pages in the website with proper names to easily identify what to open to edit a specific section
|   ├── ui/....                # Contains all the UI components
│   ├── AllRequestsPage.tsx    # List/all-requests view
│   ├── api/ApiService.tsx     # Fake API / dummy data
│   ├── AuthContext.tsx        # Authentication provider/hook (useAuth), manages user, isLoading, login/logout flow and session checks.
│   ├── CreateRequestPage.tsx  # Page to create a new request
│   ├── DashboardLayout.tsx    # Shared layout for authenticated sections (sidebar, header, content wrapper).
│   ├── EmployeeDashboard.tsx  # Employee-specific dashboard page/content.
│   ├── FirstLoginPage.tsx     # First-time login/profile completion flow for new employees/interns.
│   ├── LoginPage.tsx          # Login UI and logic
│   ├── HRDashboard.tsx        # HR-specific dashboard page/content.
│   ├── ManageUsersPage.tsx    # manage users page (create, edit users and roles)
│   ├── PasswordResetPage.tsx  # Password reset / forgot-password UI and logic.
│   ├── PendingRequestPage.tsx # List of pending requests requiring action.
│   ├── SignedDocumentPage.tsx # View/download signed documents UI.
│   └── RequestDetailPage.tsx  # Detail view for a single request
└── styles/globals.css         # Global CSS styles
```

---

## 💡 Notes

Everything runs locally — no server, no setup beyond Node.
Edit `ApiService.tsx` to tweak data or add new users.

---
