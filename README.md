# 🚗 **Project Title: RideMart - Car Rental Management System**

## 👥 Team Members
- **You** - Project Lead / Fullstack Angular Developer  
- **Member 1** - [Not Yet Contributed]  
- **Member 2** - [Not Yet Contributed]

## 📚 Project Description
RideMart is a role-based, responsive car rental management platform developed in Angular 19. The system supports three types of users: **Admin**, **Client**, and **Customer**, each with tailored dashboards and access levels. The system includes authentication, request management, car model control, internationalization (English/Arabic), and mock data powered by a JSON server.

## 🌐 Technologies Used
- **Angular 19 (Standalone Components + Signals)**
- **SCSS + Bootstrap 5**
- **ng-bootstrap** (modals, toasts, UI utilities)
- **ngx-translate** (i18n)
- **JSON-server** (mock backend)

## 🚦 Setup Instructions

```bash
# Install dependencies
npm install

# Start mock API server
npm run start:api

# Run the Angular app
ng serve
```

## 📁 Folder Structure

```
src/
│
├── app/
│   ├── core/         # Guards, Auth, Toasts, Network Watcher
│   ├── models/       # Car, CarModel, User, CarRequest interfaces
│   ├── shared/       # Loader, Toast, Reusable Tables, Pipes
│   ├── pages/
│   │   ├── auth/     # Login & Auth logic
│   │   ├── main/     # Public-facing pages (home, contact, about)
│   │   ├── admin/    # Admin dashboard, car model/request/user management
│   │   ├── client/   # Client request creation & profile management
│   │   └── customer/ # Customer car browsing & request submission
│   └── app.routes.ts
│
├── assets/
│   ├── i18n/         # en.json / ar.json for full translation
│   └── images/       # Car brands, banners, UI assets
```

## 📸 Screenshots (Suggestions)
- Login Page  
- Admin Dashboard with request/model management  
- Customer car listing in mobile view

> Add screenshots into a `/screenshots/` folder and embed here:
```markdown
![Login](screenshots/login.png)
![Admin Dashboard](screenshots/admin-dashboard.png)
![Mobile View](screenshots/mobile.png)
```

## 🔐 Role-Based Access

- **Admin**
  - Manage car models and user requests
  - View system stats
- **Client**
  - Create new car requests
  - Manage personal profile
- **Customer**
  - Browse available cars
  - Submit and view rental requests

All routes are protected via role-specific **route guards** (`AdminGuard`, `ClientGuard`, `CustomerGuard`, `NoAuthGuard`).

## 🌍 Internationalization (i18n)

- Uses `Custom i18n service `
- JSON-based dynamic language switching
- Supported languages:
  - 🇬🇧 English (`en.json`)
  - 🇸🇦 Arabic (`ar.json`)
- UI is RTL-compatible when Arabic is active

## ✅ Features Checklist

- [x] Role-based login with redirect
- [x] Form validation with live feedback
- [x] Toast messages (success, error, network status)
- [x] English/Arabic language toggle
- [x] Responsive layout for desktop and mobile
- [x] JSON-server integration for mock data

## 🧪 Testing Steps

1. **Login Test**
   - Use mock credentials for `admin`, `client`, and `customer` in The Folder named backend
   - Confirm correct dashboard and access for each role
2. **Form Validation**
   - Leave fields empty and confirm error messages
   - Try invalid email, weak passwords
3. **i18n Switching**
   - Toggle between EN/AR and verify translations
4. **Responsive Testing**
   - Open on mobile view and test layout
5. **Data Flow**
   - Submit a car request and check admin-side visibility
   - Add/delete car models from admin panel
