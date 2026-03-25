# VendorFlow API

VendorFlow is a multi-tenant inventory management API for online vendors, built with Node.js, TypeScript, Express, Prisma, and MySQL.

## Current Scope

- Batch 1 implemented:
  - Multi-tenancy foundation
  - Business/team membership and invitation flows
  - Tenant-scoped inventory, products, suppliers, categories, warehouses, and stock movement APIs
- Batch 2 started:
  - Product variants and images endpoints added
  - FIFO/LIFO inventory layer consumption added to stock-out flow

## Tech Stack

- Node.js + TypeScript
- Express.js
- Prisma ORM
- MySQL
- JWT + bcryptjs
- Zod validation

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Run app:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Authentication

- Auth uses Bearer JWT:
  - `Authorization: Bearer <access-token>`
- Tenant-scoped endpoints require:
  - `x-business-id: <business-uuid>`

## Base URL

`http://localhost:5001/api`

## Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh-token`
- `POST /auth/logout`
- `GET /auth/profile`
- `GET /auth/users` (global roles: `ADMIN`, `MANAGER`)

### Businesses (Batch 1)

All require authentication.

- `GET /businesses`
  - List current user's businesses and roles.
- `POST /businesses`
  - Create business and assign current user as `OWNER`.
  - Body:
    - `name` (required)
    - `industryType`, `address`, `currency`, `timezone`, `costingMethod`, `subscriptionTier`, `logoUrl`
- `POST /businesses/invitations/accept`
  - Accept invite token.
  - Body: `{ "token": "..." }`
- `GET /businesses/:businessId/members`
  - List active members.
- `POST /businesses/:businessId/invitations`
  - Invite/add member.
  - Body: `{ "email": "...", "role": "OWNER|MANAGER|STAFF", "expiresInHours"?: number }`
- `PATCH /businesses/:businessId/members/:memberUserId/role`
  - Update member role (owner-only logic enforced in service).
- `PATCH /businesses/:businessId/members/:memberUserId/deactivate`
  - Deactivate member (owner-only logic enforced in service).

### Products (Tenant-scoped)

All require:

- `Authorization` header
- `x-business-id` header

Endpoints:

- `GET /products`
- `GET /products/low-stock`
- `GET /products/:productId`
- `POST /products` (`OWNER`, `MANAGER`)
- `PATCH /products/:productId` (`OWNER`, `MANAGER`)
- `DELETE /products/:productId` (`OWNER`)
- `GET /products/:productId/variants`
- `POST /products/:productId/variants` (`OWNER`, `MANAGER`)
- `PATCH /products/:productId/variants/:variantId` (`OWNER`, `MANAGER`)
- `DELETE /products/:productId/variants/:variantId` (`OWNER`, `MANAGER`)
- `GET /products/:productId/images`
- `POST /products/:productId/images` (`OWNER`, `MANAGER`)
- `PATCH /products/:productId/images/:imageId` (`OWNER`, `MANAGER`)
- `DELETE /products/:productId/images/:imageId` (`OWNER`, `MANAGER`)

### Suppliers (Tenant-scoped)

- `GET /suppliers`
- `GET /suppliers/:supplierId`
- `POST /suppliers` (`OWNER`, `MANAGER`)
- `PATCH /suppliers/:supplierId` (`OWNER`, `MANAGER`)
- `DELETE /suppliers/:supplierId` (`OWNER`)

### Warehouses (Tenant-scoped)

- `GET /warehouses`
- `GET /warehouses/:warehouseId`
- `POST /warehouses` (`OWNER`, `MANAGER`)
- `PATCH /warehouses/:warehouseId` (`OWNER`, `MANAGER`)
- `DELETE /warehouses/:warehouseId` (`OWNER`)

### Categories (Tenant-scoped)

- `GET /categories`
- `POST /categories` (`OWNER`, `MANAGER`)
- `PATCH /categories/:categoryId` (`OWNER`, `MANAGER`)
- `DELETE /categories/:categoryId` (`OWNER`)

### Inventory (Tenant-scoped)

- `GET /inventory/movements`
- `POST /inventory/movements`
- `GET /inventory/warehouse/:warehouseId`
- `GET /inventory/report` (`OWNER`, `MANAGER`)

`POST /inventory/movements` now supports:

- `variantId` (optional)
- `reason` (optional)
- `unitCost` (recommended for `IN`/`ADJUSTMENT`)

Costing behavior:

- Inbound stock creates an `inventory_layers` entry.
- Stock-out consumes layers based on business `costingMethod`:
  - `FIFO`: oldest layer first
  - `LIFO`: newest layer first
- Calculated COGS is stored on the stock movement.

## Business Role Model

- `OWNER`
  - Full business control (team and settings).
- `MANAGER`
  - Operational management.
- `STAFF`
  - Day-to-day operations with reduced permissions.

## Notes

- Migrations are now tracked in `prisma/migrations`.
- Tenant isolation is enforced in service-level Prisma queries via `businessId`.
