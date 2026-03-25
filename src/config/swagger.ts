import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VendorFlow API',
      version: '1.0.0',
      description:
        'VendorFlow multi-tenant inventory management API with business/team roles, product variants, and FIFO/LIFO stock costing layers.',
      contact: {
        name: 'VendorFlow',
        email: 'support@vendorflow.local'
      }
    },
    servers: [
      {
        url: 'http://localhost:5001/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'USER'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            businessId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            sku: { type: 'string' },
            barcode: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'] },
            reorderPoint: { type: 'integer' },
            tags: { type: 'object' },
            price: { type: 'number' },
            costPrice: { type: 'number' },
            minStock: { type: 'integer' },
            categoryId: { type: 'string', format: 'uuid' },
            supplierId: { type: 'string', format: 'uuid' }
          }
        },
        ProductVariant: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            businessId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            sku: { type: 'string' },
            barcode: { type: 'string' },
            attributes: { type: 'object' },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'] },
            price: { type: 'number' },
            costPrice: { type: 'number' },
            minStock: { type: 'integer' },
            reorderPoint: { type: 'integer' },
            stockQty: { type: 'integer' }
          }
        },
        ProductImage: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            url: { type: 'string' },
            altText: { type: 'string' },
            sortOrder: { type: 'integer' },
            isPrimary: { type: 'boolean' }
          }
        },
        Business: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            industryType: { type: 'string' },
            currency: { type: 'string' },
            timezone: { type: 'string' },
            costingMethod: { type: 'string', enum: ['FIFO', 'LIFO'] },
            subscriptionTier: { type: 'string', enum: ['FREE', 'PRO'] }
          }
        },
        Supplier: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string' },
            description: { type: 'string' }
          }
        },
        Warehouse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            location: { type: 'string' },
            capacity: { type: 'integer' },
            description: { type: 'string' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' }
          }
        },
        StockMovement: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            businessId: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            variantId: { type: 'string', format: 'uuid' },
            warehouseId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer' },
            type: { type: 'string', enum: ['IN', 'OUT', 'ADJUSTMENT'] },
            reason: { type: 'string' },
            unitCost: { type: 'number' },
            cogs: { type: 'number' },
            notes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
