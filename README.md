# Inventory Management API

A comprehensive RESTful API built with TypeScript, Express, Prisma ORM, and MySQL featuring role-based access control, refresh tokens, suppliers, warehouses, and advanced stock management.

## Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Role-based access control (Admin, Manager, User)
  - Secure password hashing with bcrypt
  - Token refresh mechanism for seamless user experience

- **Product Management**
  - Complete CRUD operations for products
  - SKU and barcode tracking
  - Price and cost price management
  - Low stock alerts and tracking
  - Product categorization

- **Supplier Management**
  - Manage supplier information and contacts
  - Track products by supplier
  - Supplier relationship management

- **Warehouse Management**
  - Multi-warehouse inventory support
  - Location-based stock tracking
  - Capacity management
  - Warehouse-specific inventory reports

- **Stock Management**
  - Real-time inventory tracking
  - Stock movements (IN, OUT, ADJUSTMENT)
  - Movement history and audit trail
  - Low stock alerts
  - Comprehensive stock reports

- **Reporting & Analytics**
  - Stock value calculations
  - Inventory reports by warehouse
  - Stock movement history
  - Low stock product alerts

- **API Documentation**
  - Interactive Swagger/OpenAPI documentation
  - Complete endpoint descriptions
  - Request/response examples

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

##  Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd inventory-management-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=5001
NODE_ENV=development
DATABASE_URL="mysql://root:password@localhost:3306/inventory_management"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000
```

4. **Setup database**
```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Optional: Open Prisma Studio to view data
npm run prisma:studio
```

5. **Run the application**
```bash
# Development mode with auto-reload
npm run dev

# Production build
npm run build
npm start
```

## 📚 API Documentation

### Swagger Documentation
Once the server is running, access the interactive API documentation at:
```
http://localhost:5001/api/docs
```

### Base URL
```
http://localhost:5001/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access-token>
```

### Product Endpoints

#### Create Product (Admin/Manager only)
```http
POST /api/products
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Laptop Dell XPS 15",
  "sku": "DELL-XPS-15-001",
  "barcode": "1234567890123",
  "description": "High-performance laptop",
  "price": 1499.99,
  "costPrice": 1200.00,
  "minStock": 5,
  "categoryId": "uuid",
  "supplierId": "uuid"
}
```

#### Get All Products
```http
GET /api/products?page=1&limit=10&search=laptop&categoryId=uuid&lowStock=true
Authorization: Bearer <access-token>
```

#### Get Product by ID
```http
GET /api/products/:productId
Authorization: Bearer <access-token>
```

#### Get Low Stock Products
```http
GET /api/products/low-stock
Authorization: Bearer <access-token>
```

#### Update Product (Admin/Manager only)
```http
PATCH /api/products/:productId
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "price": 1399.99,
  "minStock": 10
}
```

#### Delete Product (Admin only)
```http
DELETE /api/products/:productId
Authorization: Bearer <access-token>
```

### Supplier Endpoints

#### Create Supplier (Admin/Manager only)
```http
POST /api/suppliers
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Tech Supplies Inc",
  "email": "contact@techsupplies.com",
  "phone": "+1234567890",
  "address": "123 Tech Street, Silicon Valley",
  "description": "Leading technology supplier"
}
```

#### Get All Suppliers
```http
GET /api/suppliers?page=1&limit=10&search=tech
Authorization: Bearer <access-token>
```

#### Get Supplier by ID
```http
GET /api/suppliers/:supplierId
Authorization: Bearer <access-token>
```

### Warehouse Endpoints

#### Create Warehouse (Admin/Manager only)
```http
POST /api/warehouses
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Main Warehouse",
  "location": "New York, NY",
  "capacity": 10000,
  "description": "Primary storage facility"
}
```

#### Get All Warehouses
```http
GET /api/warehouses
Authorization: Bearer <access-token>
```

#### Get Warehouse by ID
```http
GET /api/warehouses/:warehouseId
Authorization: Bearer <access-token>
```

### Category Endpoints

#### Create Category (Admin/Manager only)
```http
POST /api/categories
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```

#### Get All Categories
```http
GET /api/categories
Authorization: Bearer <access-token>
```

### Stock Management Endpoints

#### Record Stock Movement
```http
POST /api/inventory/movements
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "productId": "uuid",
  "warehouseId": "uuid",
  "quantity": 50,
  "type": "IN",
  "notes": "New stock arrival from supplier"
}
```

**Stock Movement Types:**
- `IN`: Stock incoming (purchase, return)
- `OUT`: Stock outgoing (sale, damage)
- `ADJUSTMENT`: Manual adjustment

#### Get All Stock Movements
```http
GET /api/inventory/movements?page=1&limit=20&productId=uuid&type=IN
Authorization: Bearer <access-token>
```

#### Get Inventory by Warehouse
```http
GET /api/inventory/warehouse/:warehouseId
Authorization: Bearer <access-token>
```

#### Get Stock Report (Admin/Manager only)
```http
GET /api/inventory/report
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Stock report generated successfully",
  "data": {
    "report": [
      {
        "id": "uuid",
        "name": "Laptop Dell XPS 15",
        "sku": "DELL-XPS-15-001",
        "totalStock": 45,
        "minStock": 5,
        "isLowStock": false,
        "price": 1499.99,
        "stockValue": 67499.55,
        "warehouseBreakdown": [
          {
            "warehouse": "Main Warehouse",
            "quantity": 30
          },
          {
            "warehouse": "Secondary Warehouse",
            "quantity": 15
          }
        ]
      }
    ],
    "summary": {
      "totalProducts": 150,
      "totalStockValue": 458750.00,
      "lowStockProducts": 12
    }
  }
}
```

##  Project Structure

```
inventory-management-api/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── swagger.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── productController.ts
│   │   ├── supplierController.ts
│   │   └── inventoryController.ts
│   ├── middlewares/
│   │   ├── auth.ts
│   │   ├── validate.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── productRoutes.ts
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── response.ts
│   │   └── validation.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── nodemon.json
├── package.json
├── tsconfig.json
└── README.md
```

## Token Refresh Flow

1. User logs in and receives access token (15m) and refresh token (7d)
2. Access token expires after 15 minutes
3. Client uses refresh token to get new access token
4. Refresh token remains valid for 7 days
5. On logout, refresh token is invalidated

##  License

ISC

## ⭐ Show your support

Give a ⭐️ if this project helped you!
