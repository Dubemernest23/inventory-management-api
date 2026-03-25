# VendorFlow Endpoints (Batch 1 + Batch 2 Start)

Base URL: `http://localhost:5001/api`

## Common Headers

- `Authorization: Bearer <access-token>` for protected endpoints
- `x-business-id: <business-id>` for tenant-scoped endpoints

## Business & Team

- `GET /businesses`
- `POST /businesses`
- `POST /businesses/invitations/accept`
- `GET /businesses/:businessId/members`
- `POST /businesses/:businessId/invitations`
- `PATCH /businesses/:businessId/members/:memberUserId/role`
- `PATCH /businesses/:businessId/members/:memberUserId/deactivate`

## Product Core

- `GET /products`
- `GET /products/low-stock`
- `GET /products/:productId`
- `POST /products`
- `PATCH /products/:productId`
- `DELETE /products/:productId`

## Product Variants (Batch 2)

- `GET /products/:productId/variants`
- `POST /products/:productId/variants`
- `PATCH /products/:productId/variants/:variantId`
- `DELETE /products/:productId/variants/:variantId`

### Create Variant Body

```json
{
  "name": "Size M / Blue",
  "sku": "TSHIRT-BLUE-M",
  "attributes": {
    "size": "M",
    "color": "Blue"
  },
  "price": 25.99,
  "costPrice": 12.5,
  "minStock": 5,
  "reorderPoint": 8
}
```

## Product Images (Batch 2)

- `GET /products/:productId/images`
- `POST /products/:productId/images`
- `PATCH /products/:productId/images/:imageId`
- `DELETE /products/:productId/images/:imageId`

### Create Image Body

```json
{
  "url": "https://cdn.example.com/products/p1/main.jpg",
  "altText": "Front view",
  "sortOrder": 0,
  "isPrimary": true
}
```

## Inventory & Stock Movement

- `GET /inventory/movements`
- `POST /inventory/movements`
- `GET /inventory/warehouse/:warehouseId`
- `GET /inventory/report`

### Stock Movement Body (Batch 2-ready)

```json
{
  "productId": "uuid",
  "variantId": "uuid",
  "warehouseId": "uuid",
  "quantity": 10,
  "type": "IN",
  "reason": "PO_RECEIPT",
  "unitCost": 11.75,
  "notes": "Received from supplier"
}
```

Notes:

- `variantId` is optional.
- `unitCost` is strongly recommended for inbound stock.
- Stock-out consumes `inventory_layers` using business `costingMethod` (`FIFO`/`LIFO`) and stores COGS on the movement.
