# Authentication System Documentation

## Overview
This authentication system provides secure user registration, login, and session management with "Remember Me" functionality.

## Features

### Password Security
- **bcrypt hashing** with 10 salt rounds for secure password storage
- **Password strength validation** (minimum 6 characters)
- Secure password comparison during sign-in

### Session Management
- **HTTP-only cookies** for secure session storage
- **Remember Me functionality**:
  - Checked: Session expires in 7 days
  - Unchecked: Session expires in 1 hour or when browser is closed
- **Automatic session cleanup** every hour
- **Session refresh** capability

### Security Features
- **Secure cookie flags** (httpOnly, secure in production, sameSite)
- **CORS credentials** enabled for cross-origin requests
- **Automatic expired session cleanup**

## API Endpoints

### Public Endpoints

#### POST /api/auth/signup
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "string",
    "username": "string"
  }
}
```

#### POST /api/auth/signin
Sign in with existing credentials.

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "rememberMe": "boolean (optional, default: false)"
}
```

**Response:**
```json
{
  "message": "Sign in successful",
  "user": {
    "id": "string",
    "username": "string"
  }
}
```

#### POST /api/auth/signout
Sign out and clear session.

**Response:**
```json
{
  "message": "Sign out successful"
}
```

### Protected Endpoints (Require Authentication)

#### GET /api/auth/me
Get current user information.

**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string"
  }
}
```

#### POST /api/auth/refresh
Refresh the current session.

**Response:**
```json
{
  "message": "Session refreshed successfully"
}
```

### Optional Authentication Endpoints

#### GET /api/auth/check
Check authentication status (works with or without authentication).

**Response:**
```json
{
  "authenticated": "boolean",
  "user": {
    "id": "string",
    "username": "string"
  }
}
```

## Frontend Integration

### AuthContext
The React AuthContext provides:
- `user`: Current user object or null
- `signIn(username, password, rememberMe)`: Sign in function
- `signUp(username, password, confirmPassword)`: Sign up function
- `signOut()`: Sign out function
- `isLoading`: Loading state

### Remember Me Functionality
- Frontend checkbox controls session duration
- When checked: 7-day session
- When unchecked: 1-hour session or until browser close

## Session Storage

### Backend Session Management
- In-memory session storage (for development)
- Session cleanup every hour
- User model tracks current session ID and expiration

### Frontend Session Handling
- HTTP-only cookies for security
- Automatic session validation on app load
- Session refresh capability

## Security Considerations

1. **Password Security**: Passwords are hashed with bcrypt before storage
2. **Session Security**: HTTP-only cookies prevent XSS attacks
3. **CORS Configuration**: Proper CORS setup for cross-origin requests
4. **Session Expiration**: Automatic cleanup of expired sessions
5. **Secure Cookies**: Production-ready cookie configuration

## Usage Examples

### Frontend Sign In Component
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const success = await signIn(username, password, rememberMe);
  if (success) {
    // User is now authenticated
  }
};
```

### Protected Route Usage
```tsx
const ProtectedComponent = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  return <div>Welcome, {user.username}!</div>;
};
```

## Development Notes

- Backend runs on port 3000
- Frontend runs on port 5175 (or next available)
- MongoDB connection required for user storage
- Session storage is in-memory (consider Redis for production)

## Dependencies

### Backend
- `bcrypt ^5.1.1` - Password hashing
- `cookie-parser ^1.4.6` - Cookie parsing middleware
- `@types/bcrypt ^5.0.2` - TypeScript types for bcrypt
- `@types/cookie-parser ^1.4.7` - TypeScript types for cookie-parser

### Frontend
- React Context for state management
- Fetch API for HTTP requests
- TypeScript for type safety
