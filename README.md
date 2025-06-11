# 🚗 **Markaba - Car Management System**

A comprehensive, role-based car rental and sales management platform built with Angular 19. Markaba connects car owners (clients) with customers looking to rent or buy vehicles, all managed through an intuitive admin dashboard.

## 👥 Team Members
- **Saleh Shalab** - Project Lead / Front-End Angular Developer

## 📚 Project Description
Markaba is a modern, responsive car management platform that facilitates car rental and sales transactions. The system features three distinct user roles with tailored dashboards, comprehensive car management, request handling, and full internationalization support for English and Arabic languages.

## 🌐 Technologies Used
- **Angular 19** (Standalone Components + Signals)
- **SCSS + Bootstrap 5** (Responsive Design)
- **PrimeNG** (UI Components, Modals, Tables, Date Pickers)
- **Custom i18n Service** (English/Arabic Translation)
- **JSON Server** (Mock Backend API)
- **Cloudinary** (Image Storage & Management)
- **Reactive Forms** (Form Validation & Management)
- **Route Guards** (Role-based Access Control)

## 🚦 Setup Instructions

```bash
# Clone the repository
git clone https://github.com/SalehShalab87/ride-mart-angular
cd ride-mart-angular

# Install dependencies
npm install

# Start the application (runs both Angular app and JSON server)
npm start

# Or run separately:
# Angular development server
ng serve

# JSON Server (mock backend)
json-server --watch backend/db.json --port 3000
```

The application will be available at `http://localhost:4200`
Mock API will run on `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/          # Route protection (Admin, Client, Customer, NoAuth)
│   │   └── services/        # Core services (Auth, API, Toast, etc.)
│   ├── models/              # TypeScript interfaces (Car, User, Request, etc.)
│   ├── shared/
│   │   ├── components/      # Reusable components (Header, Tables, Modals)
│   │   ├── constant/        # Application constants
│   │   └── pipes/           # Custom pipes
│   ├── pages/
│   │   ├── auth/           # Login & Registration components
│   │   ├── main/           # Public pages (Home, About, Contact, Car Details)
│   │   ├── admin/          # Admin dashboard & management
│   │   ├── client/         # Client car management & dashboard
│   │   └── customer/       # Customer car browsing & requests
│   └── app.routes.ts       # Application routing configuration
├── assets/
│   ├── i18n/              # Translation files (en.json, ar.json)
│   └── images/            # Static images and logos
└── backend/
    └── db.json            # Mock database with sample data
```

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Secure Login System** with role-based access control
- **User Registration** for Clients and Customers
- **Route Guards** protecting role-specific areas
- **Profile Management** with image upload capabilities

### 👨‍💼 Admin Dashboard
- **User Management** - View and manage all system users
- **Car Model Management** - Add, edit, delete car models and brands
- **Request Oversight** - Monitor all rental/purchase requests
- **System Analytics** - Dashboard with key metrics and statistics

### 🚘 Client Features
- **Car Management** - Add, edit, delete personal car listings
- **Comprehensive Car Forms** - Detailed specifications, features, and pricing
- **Image Management** - Multiple image upload with Cloudinary integration
- **Request Handling** - View and manage incoming rental/purchase requests
- **Dashboard Analytics** - Personal earnings and car performance metrics

### 🛒 Customer Experience
- **Car Browsing** - Search and filter available vehicles
- **Detailed Car Views** - Complete specifications, features, and owner information
- **Request System** - Submit rental or purchase requests with date selection
- **Request Tracking** - Monitor request status and history

### 🌍 Advanced Features
- **Full Internationalization** - Complete English/Arabic translation with RTL support
- **Responsive Design** - Mobile-first approach with Bootstrap 5
- **Real-time Validation** - Comprehensive form validation with live feedback
- **Toast Notifications** - Success, error, and warning messages
- **Image Optimization** - Cloudinary integration for fast image delivery
- **Advanced Filtering** - Search cars by specifications, location, and price
- **Pagination** - Efficient data handling with custom pagination

## 📱 User Roles & Access

### 🔧 Admin
- Complete system oversight and management
- User account approval/rejection
- Car model and brand management
- System-wide request monitoring
- Dashboard analytics and reporting

### 🏢 Client (Car Owner)
- Personal car listing management
- Request handling and approval
- Earnings tracking and analytics
- Profile and account management

### 👤 Customer
- Browse and search available cars
- Submit rental/purchase requests
- Track request status and history
- Profile management

## 🌍 Internationalization (i18n)

- **Custom i18n Service** with dynamic language switching
- **Complete Translation** - 500+ translation keys
- **RTL Support** - Full right-to-left layout for Arabic
- **Cultural Adaptation** - Currency, date formats, and cultural preferences
- **Language Persistence** - Remembers user language preference

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface with consistent styling
- **Smooth Animations** - Fade-in effects and micro-interactions
- **Loading States** - Comprehensive loading indicators
- **Error Handling** - User-friendly error messages and fallbacks
- **Accessibility** - ARIA labels and keyboard navigation support

## 📸 Screenshots

### Home Page
![image](https://github.com/user-attachments/assets/0484f39b-cb45-41b4-9830-2400c5978949)



### Admin Dashboard
![Admin Dashboard](https://github.com/user-attachments/assets/8556363c-5fa1-44eb-b4ce-884ed3103f34)
![image](https://github.com/user-attachments/assets/713cb005-e372-4a4f-b837-92bce2060ae4)




### Car Details
![Car Details](https://github.com/user-attachments/assets/3bc048af-f02a-48f8-8633-e9e809b5de3f)
![image](https://github.com/user-attachments/assets/2009653f-68f1-4048-b132-0dd374dfb872)



### Client Dashboard
![Client Dashboard](https://github.com/user-attachments/assets/c50e08b3-782b-4f3e-81a1-e7b5df0baea0)
![image](https://github.com/user-attachments/assets/47b49f96-8827-4ae6-9ca1-a4fbf5dd9a5b)




### Mobile Responsive
![Mobile View](https://github.com/user-attachments/assets/c75ab1c2-bfe9-46d8-932d-5c8a4690bb63)
![image](https://github.com/user-attachments/assets/1729dd15-09a4-4cb4-a0f2-e7a7d39fa708)




### Arabic RTL Support
![Arabic Support](https://github.com/user-attachments/assets/e4f6deff-9130-445e-a1ed-9911a5a5cc2d)
![image](https://github.com/user-attachments/assets/03a294c7-23e4-434b-b8c5-0939f4448da5)




## ✅ Implementation Status

- [x] **Complete Authentication System** with role-based access
- [x] **Admin Dashboard** with full user and car model management
- [x] **Client Car Management** with comprehensive CRUD operations
- [x] **Customer Car Browsing** with advanced search and filtering
- [x] **Request Management System** for rentals and purchases
- [x] **Profile Management** with image upload capabilities
- [x] **Full Internationalization** (English/Arabic) with RTL support
- [x] **Responsive Design** optimized for all devices
- [x] **Form Validation** with real-time feedback
- [x] **Image Management** with Cloudinary integration
- [x] **Toast Notifications** for user feedback
- [x] **Loading States** and error handling
- [x] **Advanced Car Specifications** and features management
- [x] **Pagination** and data optimization
- [x] **Route Guards** and security implementation

## 🧪 Testing Credentials

### Client Access
```
Email: john@dealer.com
Password: john123
```

### Customer Access
```
Email: sophie@buyer.com
Password: sophie
```

## 🔄 API Endpoints

The JSON server provides the following endpoints:

- `GET/POST /users` - User management
- `GET/POST/PUT/DELETE /cars` - Car operations
- `GET/POST/PUT/DELETE /carModels` - Car model management
- `GET/POST/PUT/DELETE /requests` - Request handling

## 🚀 Future Enhancements

- [ ] Real-time chat between clients and customers
- [ ] Payment integration for completed transactions
- [ ] Advanced analytics and reporting
- [ ] Mobile application development
- [ ] Integration with mapping services for car locations
- [ ] Push notifications for request updates
- [ ] Car comparison features
- [ ] Review and rating system


**Markaba** - Your premier destination for car rentals and sales 🚗✨
