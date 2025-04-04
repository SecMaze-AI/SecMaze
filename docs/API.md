# SecMaze API Reference

This document provides a comprehensive reference for the SecMaze API endpoints.

## Base URL

All API endpoints are available under the base URL:

```
https://api.secmaze.com/v1
```

For local development, the base URL is:

```
http://localhost:3000/api/v1
```

## Authentication

Most endpoints require authentication using JSON Web Tokens (JWT). To authenticate, include the JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Auth Endpoints

#### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "securepassword",
  "name": "Test User"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "60f7e5e0e7d9f53b8c1f6e9c",
    "username": "testuser",
    "email": "test@example.com",
    "name": "Test User",
    "createdAt": "2023-04-02T12:34:56.789Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/login

Authenticate a user and get a JWT token.

**Request Body:**

```json
{
  "email": "test@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "60f7e5e0e7d9f53b8c1f6e9c",
    "username": "testuser",
    "email": "test@example.com",
    "name": "Test User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /auth/verify

Verify a JWT token and get the user information.

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "60f7e5e0e7d9f53b8c1f6e9c",
    "username": "testuser",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

#### POST /auth/logout

Invalidate the current JWT token.

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Maze Endpoints

#### POST /maze/generate

Generate a new maze with specified parameters.

**Request Body:**

```json
{
  "difficulty": 2,
  "width": 10,
  "height": 10,
  "seed": 12345678  // Optional
}
```

**Response:**

```json
{
  "success": true,
  "maze": {
    "id": "60f7e5e0e7d9f53b8c1f6e9c",
    "grid": [...],  // 2D array representing the maze
    "start": { "x": 0, "y": 0 },
    "end": { "x": 9, "y": 9 },
    "difficulty": 2,
    "width": 10,
    "height": 10,
    "seed": 12345678,
    "createdAt": "2023-04-02T12:34:56.789Z"
  }
}
```

#### POST /maze/solve

Submit a solution for a maze.

**Request Body:**

```json
{
  "mazeId": "60f7e5e0e7d9f53b8c1f6e9c",
  "path": [
    { "x": 0, "y": 0 },
    { "x": 1, "y": 0 },
    // ... more coordinates
    { "x": 9, "y": 9 }
  ],
  "interactionData": [
    // Mouse movements, click events, etc.
  ]
}
```

**Response:**

```json
{
  "success": true,
  "solved": true,
  "time": 45.32,  // Time in seconds
  "score": 850,
  "optimalSolution": {
    "path": [...],  // Optimal solution path
    "length": 22
  },
  "efficiency": 0.85
}
```

#### GET /maze/stats

Get statistics for a user's maze solving history.

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalMazes": 120,
    "completedMazes": 100,
    "averageTime": 62.3,
    "averageScore": 720,
    "highestScore": 950,
    "byDifficulty": [
      {
        "difficulty": 1,
        "completed": 40,
        "averageTime": 35.2,
        "averageScore": 620
      },
      {
        "difficulty": 2,
        "completed": 35,
        "averageTime": 58.7,
        "averageScore": 720
      },
      {
        "difficulty": 3,
        "completed": 25,
        "averageTime": 87.4,
        "averageScore": 850
      }
    ]
  }
}
```

## User Endpoints

#### GET /user/profile

Get the current user's profile information.

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "60f7e5e0e7d9f53b8c1f6e9c",
    "username": "testuser",
    "email": "test@example.com",
    "name": "Test User",
    "createdAt": "2023-04-02T12:34:56.789Z",
    "stats": {
      "mazesSolved": 100,
      "totalScore": 72000,
      "rank": 42
    }
  }
}
```

#### PUT /user/profile

Update the current user's profile information.

**Request Body:**

```json
{
  "name": "Updated Name",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "60f7e5e0e7d9f53b8c1f6e9c",
    "username": "testuser",
    "email": "test@example.com",
    "name": "Updated Name",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

## Analytics Endpoints

#### GET /analytics/historical

Get historical analytics data.

**Query Parameters:**

- `period`: "day", "week", "month", "year" (default: "month")
- `metric`: "mazes", "users", "revenue", "score" (default: "mazes")

**Response:**

```json
{
  "success": true,
  "period": "month",
  "metric": "mazes",
  "data": [
    { "date": "2023-04-01", "value": 120 },
    { "date": "2023-04-02", "value": 145 },
    // ... more data points
    { "date": "2023-04-30", "value": 210 }
  ]
}
```

## Blockchain Endpoints

#### GET /blockchain/balance

Get the user's token balance.

**Response:**

```json
{
  "success": true,
  "balance": "250.75",
  "token": "SEC",
  "usdValue": "125.38"
}
```

#### POST /blockchain/transaction

Create a new blockchain transaction.

**Request Body:**

```json
{
  "to": "0x123456789abcdef",
  "amount": "10.5",
  "purpose": "reward"
}
```

**Response:**

```json
{
  "success": true,
  "transaction": {
    "id": "0x987654321fedcba",
    "from": "0xabcdef123456789",
    "to": "0x123456789abcdef",
    "amount": "10.5",
    "status": "pending",
    "timestamp": "2023-04-02T12:34:56.789Z"
  }
}
```

## Error Responses

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Authentication required or failed
- `FORBIDDEN`: Permission denied
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `INTERNAL_ERROR`: Server error
- `RATE_LIMITED`: Too many requests 