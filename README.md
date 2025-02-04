# SaaS File Management System

A scalable SaaS solution for company file management with subscription-based features. This system allows companies to manage their files with role-based access control and subscription-based limitations.

## Features

### 🏢 Company Management

- Company registration and authentication
- Employee management with role-based access (ADMIN, MANAGER, EMPLOYEE)
- Secure JWT authentication
- Company profile management
- Industry-specific categorization

### 📁 File Management

- Upload and manage CSV, XLS, XLSX files
- File sharing controls with granular permissions
- Public/private file access within company
- Selective employee access
- File size limits based on subscription
- Secure file storage and retrieval

### 💳 Subscription Plans

- **FREE**: Basic features, limited storage
- **BASIC**: Increased limits, additional features
- **PREMIUM**: Maximum storage, unlimited features
- Usage tracking and billing
- Overage calculations
- Plan upgrade/downgrade capabilities

## Tech Stack

- **Backend**: NestJS (A progressive Node.js framework)
- **Database**: MySQL with TypeORM for elegant data management
- **Authentication**: JWT (JSON Web Tokens) for secure authentication
- **File Storage**: Local storage with structured organization
- **API Documentation**: Swagger/OpenAPI for interactive documentation
- **Validation**: Class-validator for DTO validation
- **Security**: bcrypt for password hashing

## Getting Started

### Prerequisites

- Node.js (v14+)
- MySQL (v5.7+)
- npm/yarn
- Git

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/your-repo.git

npm install


cp .env.example .env
```

2. Configure environment variables

```bash
npm run migration:run

npm run start:dev


### Environment Variables
Database Configuration
DB_HOST=localhost
DB_PORT=3000
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database
JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h
Application
PORT=3000
```

## API Documentation

Visit `http://localhost:3000/docs` for interactive Swagger documentation.

### Authentication

```http
# Company Login
POST /api/auth/company/login
{
    "email": "admin@company.com",
    "password": "password123"
}

# Employee Login
POST /api/auth/employee/login
{
    "email": "employee@company.com",
    "password": "password123"
}
```

### Companies

```http
# Register Company
POST /api/companies/register
{
    "name": "Acme Corp",
    "email": "admin@acme.com",
    "password": "password123",
    "industry": "TECHNOLOGY"
}

# Get Profile
GET /api/companies/profile
Authorization: Bearer {token}
```

### Employees

```http
# Create Employee
POST /api/employees
Authorization: Bearer {token}
{
    "email": "john@company.com",
    "name": "John Doe",
    "role": "MANAGER"
}

# List Employees
GET /api/employees
Authorization: Bearer {token}
```

### Files

```http
# Upload File
POST /api/files/upload
Authorization: Bearer {token}
Form-data:
- file: (your_file.xlsx)
- isPublicInCompany: true

# Update Access
PATCH /api/files/{id}/access
Authorization: Bearer {token}
{
    "isPublicInCompany": false,
    "allowedEmployeeIds": ["uuid1", "uuid2"]
}
```

### Subscriptions

```http
# Get Current Plan
GET /api/subscriptions/current
Authorization: Bearer {token}

# Change Plan
POST /api/subscriptions/change-plan
Authorization: Bearer {token}
{
    "type": "PREMIUM"
}

# Get Billing
GET /api/subscriptions/billing
Authorization: Bearer {token}
```

## Subscription Plans

### FREE

- 10 files limit
- 5 users maximum
- 5MB per file
- No additional charges
- Basic file sharing

### BASIC ($10/month)

- 100 files
- 10 users
- 15MB per file
- $0.5 per additional file
- $5 per additional user
- Advanced file sharing

### PREMIUM ($25/month)

- 1000 files
- 25 users
- 50MB per file
- $0.25 per additional file
- $3 per additional user
- All features included

## Development

### Database Migrations

```bash
# Generate migration
npm run migration:generate src/migrations/[MigrationName]

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## Project Structure

```
src/
├── auth/           # Authentication and authorization
├── companies/      # Company management and profiles
├── employees/      # Employee management and roles
├── files/         # File operations and sharing
├── subscriptions/ # Subscription and billing
├── config/        # Application configuration
└── migrations/    # Database migrations
```

## Security Features

- JWT-based authentication with expiration
- Role-based access control (RBAC)
- File access permissions with granular control
- Password hashing using bcrypt
- Company data isolation
- Request validation
- Rate limiting
- XSS protection

## Error Handling

- Detailed error messages for debugging
- Input validation using class-validator
- Business logic validation
- File size and type validation
- Subscription limit checks
- Graceful error responses
- Error logging

## Future Improvements

1. Add file compression for storage optimization
2. Implement cloud storage (AWS S3/Google Cloud Storage)
3. Add payment processing integration
4. Email notifications for important events
5. Activity logging and audit trails
6. Advanced search functionality
7. File preview capabilities
8. Batch operations for files
9. Enhanced analytics and reporting
10. Two-factor authentication

## License

MIT License - Feel free to use this project for your own purposes.
