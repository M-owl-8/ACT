# Mission 6: API Reference Guide

## 📚 Complete API Documentation for Reminders System

This document provides comprehensive API reference for all reminders endpoints, including request/response schemas, validation rules, error handling, and usage examples.

---

## Table of Contents

1. [Base Configuration](#base-configuration)
2. [Authentication](#authentication)
3. [Endpoints Overview](#endpoints-overview)
4. [Detailed Endpoint Documentation](#detailed-endpoint-documentation)
5. [Request/Response Schemas](#requestresponse-schemas)
6. [Validation Rules](#validation-rules)
7. [Error Handling](#error-handling)
8. [Usage Examples](#usage-examples)
9. [Rate Limiting](#rate-limiting)
10. [Best Practices](#best-practices)

---

## Base Configuration

### API Base URL
```
Development: http://localhost:8000
Production: https://api.yourapp.com
```

### API Prefix
```
/reminders
```

### Content Type
```
Content-Type: application/json
```

### API Version
```
Version: 1.0.0
```

---

## Authentication

All reminders endpoints require JWT authentication.

### Authentication Header
```http
Authorization: Bearer {your_jwt_token}
```

### Getting a Token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Token Usage
```http
GET /reminders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Endpoints Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/reminders` | Create new reminder | ✅ |
| GET | `/reminders` | List all reminders (with filters) | ✅ |
| GET | `/reminders/{id}` | Get specific reminder | ✅ |
| PUT | `/reminders/{id}` | Update reminder | ✅ |
| DELETE | `/reminders/{id}` | Delete reminder | ✅ |
| POST | `/reminders/{id}/complete` | Mark reminder as done | ✅ |
| POST | `/reminders/{id}/create-expense` | Convert to expense entry | ✅ |
| GET | `/reminders/calendar/{year}/{month}` | Get calendar view | ✅ |

---

## Detailed Endpoint Documentation

### 1. Create Reminder

Create a new reminder for future expense planning.

**Endpoint**: `POST /reminders`

**Request Body**:
```json
{
  "title": "string (required)",
  "amount": "number (optional)",
  "currency": "string (optional, default: USD)",
  "reminder_date": "datetime (required, ISO 8601)",
  "note": "string (optional)",
  "category_id": "integer (optional)"
}
```

**Validation Rules**:
- `title`: Required, 1-200 characters
- `amount`: Optional, must be positive if provided
- `reminder_date`: Required, must be within 3 months from today
- `category_id`: Optional, must belong to authenticated user

**Success Response** (200):
```json
{
  "id": 123,
  "user_id": 1,
  "title": "Pay rent",
  "amount": 1500.0,
  "currency": "USD",
  "reminder_date": "2024-02-01T09:00:00Z",
  "note": "Monthly rent payment",
  "category_id": 5,
  "category": {
    "id": 5,
    "name": "Housing",
    "icon": "home",
    "color": "#FF6B6B"
  },
  "entry_id": null,
  "is_completed": false,
  "completed_at": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses**:
```json
// 400 - Validation Error
{
  "detail": "Reminder date must be within 3 months from today"
}

// 404 - Category Not Found
{
  "detail": "Category not found or does not belong to user"
}

// 401 - Unauthorized
{
  "detail": "Not authenticated"
}
```

**cURL Example**:
```bash
curl -X POST "http://localhost:8000/reminders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pay rent",
    "amount": 1500,
    "currency": "USD",
    "reminder_date": "2024-02-01T09:00:00Z",
    "note": "Monthly rent payment",
    "category_id": 5
  }'
```

---

### 2. List Reminders

Retrieve all reminders for the authenticated user with optional filtering.

**Endpoint**: `GET /reminders`

**Query Parameters**:
- `completed` (boolean, optional): Filter by completion status
  - `true`: Only completed reminders
  - `false`: Only pending reminders
  - Omit: All reminders
- `start_date` (datetime, optional): Filter reminders from this date
- `end_date` (datetime, optional): Filter reminders until this date

**Success Response** (200):
```json
[
  {
    "id": 123,
    "user_id": 1,
    "title": "Pay rent",
    "amount": 1500.0,
    "currency": "USD",
    "reminder_date": "2024-02-01T09:00:00Z",
    "note": "Monthly rent payment",
    "category_id": 5,
    "category": {
      "id": 5,
      "name": "Housing",
      "icon": "home",
      "color": "#FF6B6B"
    },
    "entry_id": null,
    "is_completed": false,
    "completed_at": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 124,
    "title": "Credit card payment",
    "amount": 500.0,
    "reminder_date": "2024-02-15T10:00:00Z",
    "category": {
      "id": 8,
      "name": "Bills",
      "icon": "receipt",
      "color": "#4ECDC4"
    },
    "is_completed": false,
    ...
  }
]
```

**Usage Examples**:

```bash
# Get all reminders
curl -X GET "http://localhost:8000/reminders" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get only pending reminders
curl -X GET "http://localhost:8000/reminders?completed=false" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get reminders in date range
curl -X GET "http://localhost:8000/reminders?start_date=2024-02-01&end_date=2024-02-29" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get completed reminders in January
curl -X GET "http://localhost:8000/reminders?completed=true&start_date=2024-01-01&end_date=2024-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Get Reminder by ID

Retrieve a specific reminder by its ID.

**Endpoint**: `GET /reminders/{id}`

**Path Parameters**:
- `id` (integer, required): Reminder ID

**Success Response** (200):
```json
{
  "id": 123,
  "user_id": 1,
  "title": "Pay rent",
  "amount": 1500.0,
  "currency": "USD",
  "reminder_date": "2024-02-01T09:00:00Z",
  "note": "Monthly rent payment",
  "category_id": 5,
  "category": {
    "id": 5,
    "name": "Housing",
    "icon": "home",
    "color": "#FF6B6B"
  },
  "entry_id": null,
  "is_completed": false,
  "completed_at": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses**:
```json
// 404 - Not Found
{
  "detail": "Reminder not found"
}

// 403 - Forbidden (reminder belongs to another user)
{
  "detail": "Not authorized to access this reminder"
}
```

**cURL Example**:
```bash
curl -X GET "http://localhost:8000/reminders/123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Update Reminder

Update an existing reminder.

**Endpoint**: `PUT /reminders/{id}`

**Path Parameters**:
- `id` (integer, required): Reminder ID

**Request Body**:
```json
{
  "title": "string (optional)",
  "amount": "number (optional)",
  "currency": "string (optional)",
  "reminder_date": "datetime (optional)",
  "note": "string (optional)",
  "category_id": "integer (optional)"
}
```

**Notes**:
- All fields are optional; only provided fields will be updated
- Same validation rules as creation apply
- Cannot update `is_completed` or `entry_id` (use dedicated endpoints)

**Success Response** (200):
```json
{
  "id": 123,
  "title": "Pay rent - UPDATED",
  "amount": 1600.0,
  "reminder_date": "2024-02-01T10:00:00Z",
  "updated_at": "2024-01-16T14:20:00Z",
  ...
}
```

**cURL Example**:
```bash
curl -X PUT "http://localhost:8000/reminders/123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pay rent - UPDATED",
    "amount": 1600
  }'
```

---

### 5. Delete Reminder

Delete a reminder permanently.

**Endpoint**: `DELETE /reminders/{id}`

**Path Parameters**:
- `id` (integer, required): Reminder ID

**Success Response** (200):
```json
{
  "message": "Reminder deleted successfully"
}
```

**Error Responses**:
```json
// 404 - Not Found
{
  "detail": "Reminder not found"
}
```

**cURL Example**:
```bash
curl -X DELETE "http://localhost:8000/reminders/123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Important Notes**:
- Deletion is permanent and cannot be undone
- If reminder was linked to an expense entry, the entry remains (not deleted)
- Local notification should be cancelled on mobile side

---

### 6. Mark Reminder as Complete

Mark a reminder as completed without creating an expense entry.

**Endpoint**: `POST /reminders/{id}/complete`

**Path Parameters**:
- `id` (integer, required): Reminder ID

**Request Body**: None

**Success Response** (200):
```json
{
  "id": 123,
  "title": "Call insurance company",
  "is_completed": true,
  "completed_at": "2024-01-16T15:30:00Z",
  "entry_id": null,
  ...
}
```

**Use Case**: When the reminder was for a task that doesn't result in an expense entry (e.g., "Call bank", "Review budget").

**cURL Example**:
```bash
curl -X POST "http://localhost:8000/reminders/123/complete" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 7. Convert Reminder to Expense

Convert a reminder into an actual expense entry (Quick Add feature).

**Endpoint**: `POST /reminders/{id}/create-expense`

**Path Parameters**:
- `id` (integer, required): Reminder ID

**Request Body**: None (uses reminder data)

**Success Response** (200):
```json
{
  "reminder": {
    "id": 123,
    "title": "Pay rent",
    "is_completed": true,
    "completed_at": "2024-02-01T09:15:00Z",
    "entry_id": 456,
    ...
  },
  "entry": {
    "id": 456,
    "user_id": 1,
    "amount": 1500.0,
    "currency": "USD",
    "type": "expense",
    "description": "Pay rent",
    "category_id": 5,
    "date": "2024-02-01T09:15:00Z",
    "note": "Monthly rent payment",
    "created_at": "2024-02-01T09:15:00Z"
  }
}
```

**Business Logic**:
1. Creates new Entry record with reminder details
2. Links entry to reminder (`entry_id` field)
3. Marks reminder as completed
4. Sets `completed_at` timestamp
5. Returns both reminder and created entry

**Validation**:
- Reminder must have `amount` field set (cannot create expense without amount)
- Reminder must not already be completed
- Category (if set) must still exist and belong to user

**Error Responses**:
```json
// 400 - Missing Amount
{
  "detail": "Cannot create expense: reminder has no amount"
}

// 400 - Already Completed
{
  "detail": "Reminder is already completed"
}
```

**cURL Example**:
```bash
curl -X POST "http://localhost:8000/reminders/123/create-expense" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 8. Get Calendar View

Retrieve reminders grouped by date for calendar display.

**Endpoint**: `GET /reminders/calendar/{year}/{month}`

**Path Parameters**:
- `year` (integer, required): Year (e.g., 2024)
- `month` (integer, required): Month (1-12)

**Query Parameters**:
- `include_completed` (boolean, optional, default: false): Include completed reminders

**Success Response** (200):
```json
{
  "2024-02-01": [
    {
      "id": 123,
      "title": "Pay rent",
      "amount": 1500.0,
      "currency": "USD",
      "reminder_date": "2024-02-01T09:00:00Z",
      "category": {
        "id": 5,
        "name": "Housing",
        "icon": "home",
        "color": "#FF6B6B"
      },
      "is_completed": false
    }
  ],
  "2024-02-15": [
    {
      "id": 124,
      "title": "Credit card payment",
      "amount": 500.0,
      "reminder_date": "2024-02-15T10:00:00Z",
      "category": {
        "id": 8,
        "name": "Bills",
        "icon": "receipt",
        "color": "#4ECDC4"
      },
      "is_completed": false
    },
    {
      "id": 125,
      "title": "Internet bill",
      "amount": 60.0,
      "reminder_date": "2024-02-15T14:00:00Z",
      "category": {
        "id": 8,
        "name": "Bills",
        "icon": "receipt",
        "color": "#4ECDC4"
      },
      "is_completed": false
    }
  ]
}
```

**Response Structure**:
- Keys: Date strings in `YYYY-MM-DD` format
- Values: Arrays of reminder objects for that date
- Only dates with reminders are included (sparse dictionary)
- Reminders sorted by time within each date

**Usage Examples**:
```bash
# Get February 2024 calendar
curl -X GET "http://localhost:8000/reminders/calendar/2024/2" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Include completed reminders
curl -X GET "http://localhost:8000/reminders/calendar/2024/2?include_completed=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Request/Response Schemas

### ReminderCreate Schema
```typescript
{
  title: string;           // Required, 1-200 chars
  amount?: number;         // Optional, positive
  currency?: string;       // Optional, default "USD"
  reminder_date: string;   // Required, ISO 8601, within 3 months
  note?: string;           // Optional, max 1000 chars
  category_id?: number;    // Optional, must belong to user
}
```

### ReminderUpdate Schema
```typescript
{
  title?: string;          // Optional, 1-200 chars
  amount?: number;         // Optional, positive
  currency?: string;       // Optional
  reminder_date?: string;  // Optional, ISO 8601, within 3 months
  note?: string;           // Optional, max 1000 chars
  category_id?: number;    // Optional, must belong to user
}
```

### ReminderResponse Schema
```typescript
{
  id: number;
  user_id: number;
  title: string;
  amount: number | null;
  currency: string;
  reminder_date: string;   // ISO 8601
  note: string | null;
  category_id: number | null;
  category: {
    id: number;
    name: string;
    icon: string;
    color: string;
  } | null;
  entry_id: number | null;
  is_completed: boolean;
  completed_at: string | null;  // ISO 8601
  created_at: string;           // ISO 8601
  updated_at: string;           // ISO 8601
}
```

### CreateExpenseResponse Schema
```typescript
{
  reminder: ReminderResponse;
  entry: {
    id: number;
    user_id: number;
    amount: number;
    currency: string;
    type: "expense";
    description: string;
    category_id: number | null;
    date: string;        // ISO 8601
    note: string | null;
    created_at: string;  // ISO 8601
  };
}
```

---

## Validation Rules

### Date Validation
```python
# 3-Month Limit
max_date = datetime.utcnow() + timedelta(days=90)
if reminder_date > max_date:
    raise ValueError("Reminder date must be within 3 months from today")

# No Past Dates
if reminder_date < datetime.utcnow():
    raise ValueError("Reminder date cannot be in the past")
```

### Amount Validation
```python
if amount is not None and amount <= 0:
    raise ValueError("Amount must be positive")
```

### Title Validation
```python
if not title or len(title) < 1:
    raise ValueError("Title is required")
if len(title) > 200:
    raise ValueError("Title must be 200 characters or less")
```

### Category Validation
```python
if category_id:
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    if not category:
        raise ValueError("Category not found or does not belong to user")
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | When It Occurs |
|------|---------|----------------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error, invalid data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | User not authorized for this resource |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Request format valid but semantically incorrect |
| 500 | Internal Server Error | Server-side error |

### Error Response Format
```json
{
  "detail": "Human-readable error message"
}
```

### Common Error Scenarios

#### 1. Authentication Errors
```json
// Missing token
{
  "detail": "Not authenticated"
}

// Invalid token
{
  "detail": "Could not validate credentials"
}

// Expired token
{
  "detail": "Token has expired"
}
```

#### 2. Validation Errors
```json
// Date too far in future
{
  "detail": "Reminder date must be within 3 months from today"
}

// Negative amount
{
  "detail": "Amount must be positive"
}

// Invalid category
{
  "detail": "Category not found or does not belong to user"
}
```

#### 3. Resource Errors
```json
// Reminder not found
{
  "detail": "Reminder not found"
}

// Cannot create expense
{
  "detail": "Cannot create expense: reminder has no amount"
}
```

---

## Usage Examples

### Complete Workflow Example

```javascript
// 1. Create a reminder
const createResponse = await fetch('http://localhost:8000/reminders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Pay rent',
    amount: 1500,
    currency: 'USD',
    reminder_date: '2024-02-01T09:00:00Z',
    note: 'Monthly rent payment',
    category_id: 5
  })
});
const reminder = await createResponse.json();
console.log('Created reminder:', reminder.id);

// 2. List upcoming reminders
const listResponse = await fetch(
  'http://localhost:8000/reminders?completed=false',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const reminders = await listResponse.json();
console.log('Upcoming reminders:', reminders.length);

// 3. Get calendar view for February
const calendarResponse = await fetch(
  'http://localhost:8000/reminders/calendar/2024/2',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const calendar = await calendarResponse.json();
console.log('Reminders on Feb 1:', calendar['2024-02-01']);

// 4. Convert reminder to expense
const expenseResponse = await fetch(
  `http://localhost:8000/reminders/${reminder.id}/create-expense`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const { reminder: updatedReminder, entry } = await expenseResponse.json();
console.log('Created expense:', entry.id);
console.log('Reminder completed:', updatedReminder.is_completed);
```

### Python Example

```python
import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"
token = "your_jwt_token"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Create reminder
reminder_data = {
    "title": "Pay rent",
    "amount": 1500,
    "currency": "USD",
    "reminder_date": (datetime.utcnow() + timedelta(days=15)).isoformat() + "Z",
    "note": "Monthly rent payment",
    "category_id": 5
}
response = requests.post(f"{BASE_URL}/reminders", json=reminder_data, headers=headers)
reminder = response.json()
print(f"Created reminder: {reminder['id']}")

# List reminders
response = requests.get(f"{BASE_URL}/reminders?completed=false", headers=headers)
reminders = response.json()
print(f"Upcoming reminders: {len(reminders)}")

# Convert to expense
response = requests.post(
    f"{BASE_URL}/reminders/{reminder['id']}/create-expense",
    headers=headers
)
result = response.json()
print(f"Created expense: {result['entry']['id']}")
```

---

## Rate Limiting

### Current Limits
- **No rate limiting implemented** in current version
- Recommended for production: 100 requests/minute per user

### Future Implementation
```python
# Recommended rate limiting strategy
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/reminders")
@limiter.limit("10/minute")
async def create_reminder(...):
    ...
```

---

## Best Practices

### 1. Always Handle Errors
```javascript
try {
  const response = await fetch('/reminders', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(reminderData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.detail);
    // Show user-friendly error message
    return;
  }
  
  const reminder = await response.json();
  // Success handling
} catch (error) {
  console.error('Network error:', error);
  // Show network error message
}
```

### 2. Validate Before Sending
```javascript
// Client-side validation
const validateReminder = (data) => {
  if (!data.title || data.title.length < 1) {
    return 'Title is required';
  }
  if (data.amount && data.amount <= 0) {
    return 'Amount must be positive';
  }
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  if (new Date(data.reminder_date) > maxDate) {
    return 'Date must be within 3 months';
  }
  return null;
};
```

### 3. Use Proper Date Formats
```javascript
// Always use ISO 8601 format
const reminderDate = new Date('2024-02-01T09:00:00');
const isoString = reminderDate.toISOString(); // "2024-02-01T09:00:00.000Z"
```

### 4. Cache Calendar Data
```javascript
// Cache calendar data to reduce API calls
const calendarCache = new Map();

const getCalendar = async (year, month) => {
  const key = `${year}-${month}`;
  if (calendarCache.has(key)) {
    return calendarCache.get(key);
  }
  
  const response = await fetch(`/reminders/calendar/${year}/${month}`);
  const data = await response.json();
  calendarCache.set(key, data);
  return data;
};
```

### 5. Refresh Token Before Expiry
```javascript
// Check token expiry and refresh proactively
const isTokenExpiringSoon = (token) => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expiryTime = payload.exp * 1000;
  const now = Date.now();
  return expiryTime - now < 5 * 60 * 1000; // 5 minutes
};
```

---

## Testing with Swagger UI

Access interactive API documentation at:
```
http://localhost:8000/docs
```

### Steps to Test:
1. Click "Authorize" button
2. Enter your JWT token: `Bearer YOUR_TOKEN`
3. Click "Authorize" to save
4. Navigate to `/reminders` section
5. Try out endpoints with "Try it out" button
6. View request/response in real-time

---

## Postman Collection

### Import Collection
```json
{
  "info": {
    "name": "Bitway Reminders API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Create Reminder",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/reminders",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Pay rent\",\n  \"amount\": 1500,\n  \"reminder_date\": \"2024-02-01T09:00:00Z\",\n  \"category_id\": 5\n}"
        }
      }
    }
  ]
}
```

---

**Document**: 2 of 10 in Mission 6 Documentation Suite  
**Last Updated**: January 2024  
**Version**: 1.0.0