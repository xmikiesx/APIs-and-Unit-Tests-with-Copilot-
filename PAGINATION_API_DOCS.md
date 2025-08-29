# Users API with Pagination and Filters

This document describes the enhanced Users API that supports pagination and filtering capabilities.

## Endpoint

### GET /users

List users from the simulated database with support for pagination and role-based filtering.

**Authentication**: Required (JWT token)

## Query Parameters

| Parameter | Type    | Default | Description                              |
| --------- | ------- | ------- | ---------------------------------------- |
| `limit`   | integer | 10      | Number of users per page (maximum: 100)  |
| `offset`  | integer | 0       | Number of users to skip for pagination   |
| `role`    | string  | null    | Filter users by role (`admin` or `user`) |

## Request Examples

### Basic request (default pagination)

```bash
curl -X GET "http://localhost:3000/users" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Pagination with custom limit

```bash
curl -X GET "http://localhost:3000/users?limit=5&offset=10" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Filter by role

```bash
curl -X GET "http://localhost:3000/users?role=admin" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Combined pagination and filtering

```bash
curl -X GET "http://localhost:3000/users?role=user&limit=3&offset=6" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "user"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 15,
    "limit": 10,
    "offset": 0,
    "hasNext": true,
    "hasPrevious": false
  },
  "filters": {
    "role": null
  }
}
```

### Response Fields

#### Data Array

Each user object contains:

- `id`: Unique user identifier
- `name`: User's full name
- `email`: User's email address
- `role`: User's role (`admin` or `user`)

#### Pagination Object

- `currentPage`: Current page number (1-based)
- `totalPages`: Total number of pages
- `totalCount`: Total number of users (after filtering)
- `limit`: Number of users per page requested
- `offset`: Number of users skipped
- `hasNext`: Boolean indicating if there's a next page
- `hasPrevious`: Boolean indicating if there's a previous page

#### Filters Object

- `role`: Applied role filter or `null` if no filter

## Error Responses

### 400 Bad Request - Invalid Role Filter

```json
{
  "error": "Invalid role filter",
  "message": "Role must be either 'admin' or 'user'"
}
```

### 401 Unauthorized - Missing Token

```json
{
  "error": "Access denied. No token provided.",
  "message": "A valid JWT token is required to access this resource."
}
```

### 401 Unauthorized - Invalid Token

```json
{
  "error": "Invalid token.",
  "message": "The provided JWT token is invalid or expired."
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "An error occurred while fetching users"
}
```

## Simulated Database

The endpoint uses a simulated database with 15 users:

- 5 users with `admin` role
- 10 users with `user` role

Users are pre-populated with sample data including names, emails, and roles.

## Usage Notes

1. **Maximum Limit**: The `limit` parameter is capped at 100 to prevent excessive data retrieval.

2. **Default Values**: If no query parameters are provided, the endpoint returns the first 10 users.

3. **Role Validation**: Only `admin` and `user` roles are supported. Invalid roles return a 400 error.

4. **Pagination Calculation**:

   - `currentPage` = `Math.floor(offset / limit) + 1`
   - `totalPages` = `Math.ceil(totalCount / limit)`

5. **Filtering Before Pagination**: Role filtering is applied before pagination, so pagination metadata reflects the filtered dataset.

6. **Edge Cases**:
   - If `offset` exceeds total count, an empty array is returned
   - Negative values for `limit` or `offset` are treated as 0
   - Non-integer values are parsed as integers

## Example Workflows

### Browse all users with pagination

1. Start with `GET /users` (first 10 users)
2. Use `GET /users?offset=10` for next page
3. Continue with `offset=20`, `offset=30`, etc.

### Find all admin users

1. Use `GET /users?role=admin` to get all admins
2. Apply pagination if needed: `GET /users?role=admin&limit=5&offset=0`

### Search with custom page size

1. Use `GET /users?limit=5` for 5 users per page
2. Navigate with `offset=5`, `offset=10`, etc.

This endpoint provides a foundation for user management interfaces with efficient data loading and filtering capabilities.
