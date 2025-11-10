# Form V2 API Specification

## Overview
RESTful API for managing dynamic forms, collecting responses, and sharing forms via public links. Supports creating, reading, updating, and deleting forms with custom field configurations.

**Base URL**: `/api/v2/forms`

**Interactive Docs**: `http://127.0.0.1:8000/api/v1/docs#/forms-v2` (when running locally)

**Authentication**: 
- Most endpoints require Bearer token authentication via `Authorization` header
- Public endpoints (form rendering and submission) do not require authentication

**Authorization**: Write operations require `Admin` role on the project.

**Key Features**:
- Create dynamic forms with text, number, and choice fields
- Automatic generation of unique public links for form sharing
- Public form submission (no authentication required)
- Response collection and management
- Field validation and required field enforcement
- Response tracking (IP address, user agent, timestamps)

---

## Interactive API Documentation

The API includes auto-generated interactive documentation:

**Swagger UI**: `http://127.0.0.1:8000/api/v1/docs`
- Interactive UI to test endpoints
- Shows all request/response schemas
- Includes authentication (click "Authorize" button)

**ReDoc**: `http://127.0.0.1:8000/api/v1/redoc`
- Alternative documentation view
- Better for reading and reference

**OpenAPI JSON**: `http://127.0.0.1:8000/api/v1/openapi.json`
- Raw OpenAPI 3.0 specification
- Can be imported into Postman, Insomnia, etc.

### Using Swagger UI

1. Navigate to http://127.0.0.1:8000/api/v1/docs
2. Click "Authorize" button at the top
3. Enter your JWT token: `Bearer <your_token>`
4. Click "Authorize" then "Close"
5. Expand the `forms-v2` section
6. Try out any endpoint by clicking "Try it out"

---

## Data Models

### Form Object
```typescript
{
  id: string;                    // UUID
  project_id: string;            // UUID
  name: string;                  // max 255 chars
  form_type: string;             // e.g., "custom"
  description: string | null;
  is_active: boolean;
  public_link: string;           // 16-character unique link for public access
  config: object;                // JSONB metadata
  created_at: string;            // ISO 8601 datetime
  updated_at: string | null;     // ISO 8601 datetime
  fields: FormField[];           // Array of form fields
}
```

### Form Field Object
```typescript
{
  id: string;                    // UUID
  form_id: string;               // UUID
  field_type: string;            // "text" | "number" | "choice"
  field_key: string;             // Unique identifier for the field
  label: string;                 // Display label
  is_required: boolean;
  order_index: number;           // Display order
  config: Array<{                // Field-specific configuration
    key: string;
    value: any;
  }>;
  created_at: string;            // ISO 8601 datetime
  updated_at: string | null;     // ISO 8601 datetime
}
```

### Field Types

**Important**: Fields use discriminated unions based on `field_type`. The API will validate the request based on which `field_type` you provide.

#### Text Field
```typescript
{
  field_type: "text";
  field_key: string;
  label: string;
  is_required?: boolean;         // default: false
  order_index?: number;          // default: 0
  max_length?: number | null;    // optional constraint
  default_value?: string | null; // optional default
}
```

#### Number Field
```typescript
{
  field_type: "number";
  field_key: string;
  label: string;
  is_required?: boolean;         // default: false
  order_index?: number;          // default: 0
  min_value?: number | null;     // optional constraint
  max_value?: number | null;     // optional constraint
  default_value?: number | null; // optional default
}
```

#### Choice Field
```typescript
{
  field_type: "choice";
  field_key: string;
  label: string;
  is_required?: boolean;         // default: false
  order_index?: number;          // default: 0
  choices: string[];             // Array of choice options
  multiple?: boolean;            // default: false (single vs multi-select)
  default_value?: string | string[] | null; // optional default
}
```

### Form Response Object
```typescript
{
  id: string;                         // UUID
  form_id: string;                    // UUID
  answers: {                          // Response data keyed by field_key
    [field_key: string]: any;         // Values vary by field type
  };
  submitter_name: string | null;      // Optional submitter name
  submitter_email: string | null;     // Optional submitter email
  ip_address: string | null;          // Captured IP address
  user_agent: string | null;          // Captured browser user agent
  created_at: string;                 // ISO 8601 datetime
  updated_at: string | null;          // ISO 8601 datetime
}
```

### Form Submission Success Response
```typescript
{
  message: string;                    // "Thank you for your submission"
  success: boolean;                   // true
}
```

---

## Quick Reference

### Authenticated Endpoints (Require Bearer Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/forms/` | Create a new form |
| GET | `/api/v2/forms/{form_id}` | Get form by ID |
| GET | `/api/v2/forms/` | List forms (filter by project) |
| PUT | `/api/v2/forms/{form_id}` | Update form metadata |
| DELETE | `/api/v2/forms/{form_id}` | Delete form |
| POST | `/api/v2/forms/{form_id}/fields` | Add field to form |
| GET | `/api/v2/forms/{form_id}/fields` | List form fields |
| PUT | `/api/v2/forms/{form_id}/fields/{field_id}` | Update field |
| DELETE | `/api/v2/forms/{form_id}/fields/{field_id}` | Delete field |
| GET | `/api/v2/forms/{form_id}/responses` | Get form responses (paginated) |

### Public Endpoints (No Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/forms/public/{public_link}` | Get form by public link |
| POST | `/api/v2/forms/public/{public_link}/submit` | Submit form response |

---

## API Endpoints

### 1. Create Form

**POST** `/api/v2/forms/`

Create a new form with optional fields.

**Request Body:**
```json
{
  "project_id": "uuid",
  "name": "Customer Feedback Form",
  "description": "Collect customer feedback",
  "is_active": true,
  "fields": [
    {
      "field_type": "text",
      "field_key": "customer_name",
      "label": "Your Name",
      "is_required": true,
      "max_length": 100,
      "order_index": 0
    },
    {
      "field_type": "number",
      "field_key": "rating",
      "label": "Rating (1-5)",
      "is_required": true,
      "min_value": 1,
      "max_value": 5,
      "order_index": 1
    },
    {
      "field_type": "choice",
      "field_key": "category",
      "label": "Feedback Category",
      "is_required": false,
      "choices": ["Bug", "Feature Request", "Other"],
      "multiple": false,
      "order_index": 2
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "name": "Customer Feedback Form",
  "form_type": "custom",
  "description": "Collect customer feedback",
  "is_active": true,
  "public_link": "AbCdEfGhIjKlMnOp",
  "config": {},
  "created_at": "2025-11-09T10:30:00Z",
  "updated_at": null,
  "fields": [
    {
      "id": "uuid",
      "form_id": "uuid",
      "field_type": "text",
      "field_key": "customer_name",
      "label": "Your Name",
      "is_required": true,
      "config": [
        {"key": "max_length", "value": 100}
      ],
      "order_index": 0,
      "created_at": "2025-11-09T10:30:00Z",
      "updated_at": null
    },
    // ... other fields
  ]
}
```

**Notes:**
- The `public_link` is automatically generated (16-character random string)
- Share the public link with end users: `/api/v2/forms/public/{public_link}`
- Users can submit responses without authentication

**Errors:**
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - User doesn't have Admin access to project
- `404 Not Found` - Project doesn't exist
- `422 Unprocessable Entity` - Validation error

---

### 2. Get Form

**GET** `/api/v2/forms/{form_id}`

Retrieve a single form with all its fields.

**Path Parameters:**
- `form_id` (string, UUID) - The form ID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "name": "Customer Feedback Form",
  "form_type": "custom",
  "description": "Collect customer feedback",
  "is_active": true,
  "public_link": "AbCdEfGhIjKlMnOp",
  "config": {},
  "created_at": "2025-11-09T10:30:00Z",
  "updated_at": null,
  "fields": [ /* array of fields */ ]
}
```

**Errors:**
- `401 Unauthorized`
- `403 Forbidden` - User doesn't have access to project
- `404 Not Found` - Form doesn't exist

---

### 3. List Forms

**GET** `/api/v2/forms/`

List all forms, optionally filtered by project.

**Query Parameters:**
- `project_id` (string, UUID, optional) - Filter by project
- `skip` (number, optional, default: 0) - Pagination offset
- `limit` (number, optional, default: 100, max: 1000) - Pagination limit

**Example Request:**
```
GET /api/v2/forms/?project_id=uuid&skip=0&limit=10
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "project_id": "uuid",
    "name": "Form 1",
    "form_type": "custom",
    "description": "Description",
    "is_active": true,
    "public_link": "AbCdEfGhIjKlMnOp",
    "config": {},
    "created_at": "2025-11-09T10:30:00Z",
    "updated_at": null,
    "fields": [ /* fields */ ]
  },
  // ... more forms
]
```

**Errors:**
- `401 Unauthorized`
- `403 Forbidden` - User doesn't have access to project (if project_id provided)

---

### 4. Update Form

**PUT** `/api/v2/forms/{form_id}`

Update form metadata (name, description, is_active). Does NOT update fields - use field endpoints for that.

**Path Parameters:**
- `form_id` (string, UUID) - The form ID

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Form Name",
  "description": "Updated description",
  "is_active": false
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "name": "Updated Form Name",
  "form_type": "custom",
  "description": "Updated description",
  "is_active": false,
  "public_link": "AbCdEfGhIjKlMnOp",
  "config": {},
  "created_at": "2025-11-09T10:30:00Z",
  "updated_at": "2025-11-09T11:00:00Z",
  "fields": [ /* fields */ ]
}
```

**Errors:**
- `401 Unauthorized`
- `403 Forbidden` - User doesn't have Admin access
- `404 Not Found` - Form doesn't exist
- `422 Unprocessable Entity` - Validation error

---

### 5. Delete Form

**DELETE** `/api/v2/forms/{form_id}`

Delete a form. This will cascade delete all associated fields.

**Path Parameters:**
- `form_id` (string, UUID) - The form ID

**Response:** `204 No Content`

**Errors:**
- `401 Unauthorized`
- `403 Forbidden` - User doesn't have Admin access
- `404 Not Found` - Form doesn't exist

---

### 6. Add Field to Form

**POST** `/api/v2/forms/{form_id}/fields`

Add a new field to an existing form.

**Path Parameters:**
- `form_id` (string, UUID) - The form ID

**Request Body:** (One of the field types)
```json
{
  "field_type": "text",
  "field_key": "email",
  "label": "Email Address",
  "is_required": true,
  "max_length": 255,
  "order_index": 3
}
```

**Note**: The `field_type` property determines which field schema is used. You cannot mix properties from different field types (e.g., cannot have both `max_length` and `choices` in the same request).

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "form_id": "uuid",
  "field_type": "text",
  "field_key": "email",
  "label": "Email Address",
  "is_required": true,
  "config": [
    {"key": "max_length", "value": 255}
  ],
  "order_index": 3,
  "created_at": "2025-11-09T11:00:00Z",
  "updated_at": null
}
```

**Errors:**
- `401 Unauthorized`
- `403 Forbidden` - User doesn't have Admin access
- `404 Not Found` - Form doesn't exist
- `422 Unprocessable Entity` - Validation error

---

### 7. List Form Fields

**GET** `/api/v2/forms/{form_id}/fields`

Get all fields for a specific form. (Note: You can also get fields via GET /forms/{form_id})

**Path Parameters:**
- `form_id` (string, UUID) - The form ID

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "form_id": "uuid",
    "field_type": "text",
    "field_key": "customer_name",
    "label": "Your Name",
    "is_required": true,
    "config": [{"key": "max_length", "value": 100}],
    "order_index": 0,
    "created_at": "2025-11-09T10:30:00Z",
    "updated_at": null
  },
  // ... more fields
]
```

**Errors:**
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found` - Form doesn't exist

---

### 8. Update Field

**PUT** `/api/v2/forms/{form_id}/fields/{field_id}`

Update a field's properties. All properties are optional - only send what you want to change.

**Path Parameters:**
- `form_id` (string, UUID) - The form ID
- `field_id` (string, UUID) - The field ID

**Request Body:** (all fields optional)

For text field:
```json
{
  "field_type": "text",
  "label": "Updated Label",
  "is_required": true,
  "max_length": 200
}
```

For number field:
```json
{
  "field_type": "number",
  "label": "Updated Label",
  "min_value": 0,
  "max_value": 100
}
```

For choice field:
```json
{
  "field_type": "choice",
  "label": "Updated Label",
  "choices": ["Option 1", "Option 2", "Option 3"],
  "multiple": true
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "form_id": "uuid",
  "field_type": "text",
  "field_key": "customer_name",
  "label": "Updated Label",
  "is_required": true,
  "config": [{"key": "max_length", "value": 200}],
  "order_index": 0,
  "created_at": "2025-11-09T10:30:00Z",
  "updated_at": "2025-11-09T11:30:00Z"
}
```

**Errors:**
- `401 Unauthorized`
- `403 Forbidden` - User doesn't have Admin access
- `404 Not Found` - Form or field doesn't exist
- `422 Unprocessable Entity` - Validation error

**Notes:**
- You can change field type by providing a different `field_type`
- Properties not included in the request will remain unchanged
- Changing field type will reset the config to match the new type
- The `field_type` property is **required** in update requests to determine which schema to validate against

---

### 9. Delete Field

**DELETE** `/api/v2/forms/{form_id}/fields/{field_id}`

Delete a field from a form.

**Path Parameters:**
- `form_id` (string, UUID) - The form ID
- `field_id` (string, UUID) - The field ID

**Response:** `204 No Content`

**Errors:**
- `401 Unauthorized`
- `403 Forbidden` - User doesn't have Admin access
- `404 Not Found` - Form or field doesn't exist

---

## Public Form Endpoints (No Authentication Required)

The following endpoints are public and do not require authentication. They use the form's `public_link` instead of the form ID.

### 10. Get Form by Public Link

**GET** `/api/v2/forms/public/{public_link}`

Retrieve a form using its public link. This endpoint is used to render forms to end users.

**Path Parameters:**
- `public_link` (string) - The 16-character public link (e.g., `AbCdEfGhIjKlMnOp`)

**Authentication:** None required

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "name": "Customer Feedback Form",
  "form_type": "custom",
  "description": "Collect customer feedback",
  "is_active": true,
  "public_link": "AbCdEfGhIjKlMnOp",
  "config": {},
  "created_at": "2025-11-09T10:30:00Z",
  "updated_at": null,
  "fields": [
    {
      "id": "uuid",
      "form_id": "uuid",
      "field_type": "text",
      "field_key": "customer_name",
      "label": "Your Name",
      "is_required": true,
      "config": [{"key": "max_length", "value": 100}],
      "order_index": 0,
      "created_at": "2025-11-09T10:30:00Z",
      "updated_at": null
    }
  ]
}
```

**Errors:**
- `404 Not Found` - Form with this public link doesn't exist

**Notes:**
- The `public_link` is automatically generated when a form is created
- It's a 16-character string containing uppercase and lowercase letters
- This link can be shared with end users to collect responses

---

### 11. Submit Form Response

**POST** `/api/v2/forms/public/{public_link}/submit`

Submit a response to a form via its public link.

**Path Parameters:**
- `public_link` (string) - The form's public link

**Authentication:** None required

**Request Body:**
```json
{
  "answers": {
    "customer_name": "John Doe",
    "rating": 5,
    "category": "Feature Request",
    "comments": "Great product!"
  },
  "submitter_name": "John Doe",
  "submitter_email": "john@example.com"
}
```

**Request Body Schema:**
- `answers` (object, required) - Dictionary of answers keyed by `field_key`
  - Keys must match the `field_key` of form fields
  - Values must be appropriate for the field type (string for text, number for number, string or array for choice)
- `submitter_name` (string, optional, max 255 chars) - Name of the person submitting
- `submitter_email` (string, optional, max 255 chars) - Email of the person submitting

**Response:** `201 Created`
```json
{
  "message": "Thank you for your submission",
  "success": true
}
```

**Errors:**
- `400 Bad Request` - Validation errors:
  - Form is not active (inactive forms don't accept responses)
  - Required fields are missing or empty
  - Invalid data types for field values
- `404 Not Found` - Form with this public link doesn't exist

**Validation Rules:**
- All fields marked `is_required: true` must have non-empty values in `answers`
- Empty strings, null values, and empty arrays are considered missing for required fields
- The form must have `is_active: true` to accept submissions
- Field keys in `answers` don't need to match all form fields (allows for partial submissions of optional fields)

**Tracking:**
- IP address and User-Agent are automatically captured server-side
- These are stored with the response but not returned in the public API

**Example Errors:**
```json
// Missing required fields
{
  "detail": "Required fields missing: Your Name, Rating (1-5)"
}

// Inactive form
{
  "detail": "This form is no longer accepting responses"
}
```

---

## Form Response Management (Authenticated)

These endpoints allow form owners to view and manage responses submitted to their forms.

### 12. Get Form Responses

**GET** `/api/v2/forms/{form_id}/responses`

Retrieve all responses for a specific form with pagination.

**Path Parameters:**
- `form_id` (string, UUID) - The form ID

**Query Parameters:**
- `skip` (integer, optional, default: 0, min: 0) - Number of records to skip for pagination
- `limit` (integer, optional, default: 100, min: 1, max: 1000) - Maximum number of records to return

**Authentication:** Required - User must have access to the form's project

**Response:** `200 OK`
```json
{
  "total": 42,
  "items": [
    {
      "id": "uuid",
      "form_id": "uuid",
      "answers": {
        "customer_name": "John Doe",
        "rating": 5,
        "category": "Feature Request",
        "comments": "Great product!"
      },
      "submitter_name": "John Doe",
      "submitter_email": "john@example.com",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-11-10T14:30:00Z",
      "updated_at": null
    },
    {
      "id": "uuid",
      "form_id": "uuid",
      "answers": {
        "customer_name": "Jane Smith",
        "rating": 4,
        "category": "Bug"
      },
      "submitter_name": "Jane Smith",
      "submitter_email": "jane@example.com",
      "ip_address": "192.168.1.2",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-11-10T15:00:00Z",
      "updated_at": null
    }
  ]
}
```

**Response Schema:**
- `total` (integer) - Total number of responses for this form
- `items` (array) - Array of response objects
  - `id` (string, UUID) - Response ID
  - `form_id` (string, UUID) - The form ID
  - `answers` (object) - Response data keyed by field_key
  - `submitter_name` (string | null) - Submitter's name if provided
  - `submitter_email` (string | null) - Submitter's email if provided
  - `ip_address` (string | null) - IP address of submitter
  - `user_agent` (string | null) - Browser user agent of submitter
  - `created_at` (string) - ISO 8601 datetime when response was submitted
  - `updated_at` (string | null) - ISO 8601 datetime if response was updated

**Errors:**
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - User doesn't have access to this form's project
- `404 Not Found` - Form doesn't exist

**Notes:**
- Responses are returned in descending order by `created_at` (newest first)
- The `answers` object may contain field keys that no longer exist in the current form schema (if fields were deleted)
- The `answers` object may be missing keys for fields that were added after the response was submitted
- Use pagination for large response sets to improve performance

**Example Pagination:**
```typescript
// Get first page (first 50 responses)
const page1 = await fetch('/api/v2/forms/uuid/responses?skip=0&limit=50');

// Get second page (next 50 responses)
const page2 = await fetch('/api/v2/forms/uuid/responses?skip=50&limit=50');
```

---

## Common UI Workflows

### 1. Form Builder - Initial Load
```typescript
// Load existing form with all fields
const response = await fetch(`/api/v2/forms/${formId}`, {
  headers: { Authorization: `Bearer ${token}` }
});
const form = await response.json();
// form.fields contains all fields sorted by order_index
```

### 2. Real-time Field Editing (Granular Updates)
```typescript
// User updates a field label
await fetch(`/api/v2/forms/${formId}/fields/${fieldId}`, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    field_type: 'text',
    label: 'New Label'
  })
});

// User adds a new field
await fetch(`/api/v2/forms/${formId}/fields`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    field_type: 'text',
    field_key: 'new_field',
    label: 'New Field',
    is_required: false,
    order_index: 5
  })
});

// User deletes a field
await fetch(`/api/v2/forms/${formId}/fields/${fieldId}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` }
});
```

### 3. Create New Form
```typescript
const response = await fetch('/api/v2/forms/', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    project_id: projectId,
    name: 'New Form',
    description: 'Form description',
    is_active: true,
    fields: [
      {
        field_type: 'text',
        field_key: 'name',
        label: 'Name',
        is_required: true,
        max_length: 100,
        order_index: 0
      }
    ]
  })
});
const newForm = await response.json();
```

### 4. List All Forms for a Project
```typescript
const response = await fetch(
  `/api/v2/forms/?project_id=${projectId}&limit=50`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const forms = await response.json();
```

### 5. Public Form Rendering and Submission
```typescript
// Render form to end user (no authentication)
const formResponse = await fetch(`/api/v2/forms/public/${publicLink}`);
const form = await formResponse.json();

// Display form to user, collect answers...

// Submit form response (no authentication)
const submitResponse = await fetch(
  `/api/v2/forms/public/${publicLink}/submit`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      answers: {
        name: 'John Doe',
        email: 'john@example.com',
        rating: 5
      },
      submitter_name: 'John Doe',
      submitter_email: 'john@example.com'
    })
  }
);

const result = await submitResponse.json();
// { message: "Thank you for your submission", success: true }
```

### 6. View Form Responses (Form Owner)
```typescript
// Get all responses for a form
const response = await fetch(`/api/v2/forms/${formId}/responses?skip=0&limit=100`, {
  headers: { Authorization: `Bearer ${token}` }
});
const { total, items } = await response.json();

// Process responses
items.forEach(response => {
  console.log(`Response from ${response.submitter_name}:`);
  console.log(response.answers);
  console.log(`Submitted at: ${response.created_at}`);
  console.log(`IP: ${response.ip_address}`);
});
```

### 7. Share Form with End Users
```typescript
// Get form details including public link
const form = await fetch(`/api/v2/forms/${formId}`, {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json());

// Share this URL with end users
const publicFormUrl = `https://your-app.com/forms/${form.public_link}`;

// Users can access the form without authentication
// and submit responses via the public endpoints
```

---
  { headers: { Authorization: `Bearer ${token}` } }
);
const forms = await response.json();
```

---

## Field Config Storage

Fields store their type-specific constraints in a `config` array:

**Text Field Config:**
```json
[
  {"key": "max_length", "value": 255},
  {"key": "default_value", "value": "Default text"}
]
```

**Number Field Config:**
```json
[
  {"key": "min_value", "value": 0},
  {"key": "max_value", "value": 100},
  {"key": "default_value", "value": 50}
]
```

**Choice Field Config:**
```json
[
  {"key": "choices", "value": ["Option 1", "Option 2", "Option 3"]},
  {"key": "multiple", "value": false},
  {"key": "default_value", "value": "Option 1"}
]
```

---

## Error Response Format

All errors follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

For validation errors (422):
```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Common Validation Errors:**

Discriminated union error (wrong field_type):
```json
{
  "detail": [
    {
      "ctx": {
        "discriminator": "'field_type'",
        "expected_tags": "'text', 'number', 'choice'",
        "tag": "invalid_type"
      },
      "loc": ["body"],
      "msg": "Input tag 'invalid_type' found using 'field_type' does not match any of the expected tags: 'text', 'number', 'choice'",
      "type": "union_tag_invalid"
    }
  ]
}
```

Missing required field in choice field:
```json
{
  "detail": [
    {
      "loc": ["body", "choices"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## Authentication

Include the JWT token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The token should contain:
- `user_id` - User's UUID
- `email` - User's email
- `role` - User's role

---

## Rate Limiting

All endpoints are subject to rate limiting. Check response headers:
- `X-RateLimit-Limit` - Maximum requests per window
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Time when limit resets

---

## Best Practices

1. **Optimistic UI Updates**: Update UI immediately, rollback on error
2. **Debounce Updates**: For real-time editing, debounce field updates (300-500ms)
3. **Validate Locally**: Validate field constraints before sending to API
4. **Handle 404s**: Form/field may be deleted by another user - refresh if needed
5. **Preserve Order**: Use `order_index` to maintain field display order
6. **Unique Keys**: Ensure `field_key` is unique within a form for data mapping

---

## TypeScript Type Definitions

```typescript
type FieldType = 'text' | 'number' | 'choice';

interface FormField {
  id: string;
  form_id: string;
  field_type: FieldType;
  field_key: string;
  label: string;
  is_required: boolean;
  order_index: number;
  config: Array<{ key: string; value: any }>;
  created_at: string;
  updated_at: string | null;
}

interface Form {
  id: string;
  project_id: string;
  name: string;
  form_type: string;
  description: string | null;
  is_active: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string | null;
  fields: FormField[];
}

interface TextFieldCreate {
  field_type: 'text';
  field_key: string;
  label: string;
  is_required?: boolean;
  order_index?: number;
  max_length?: number;
  default_value?: string;
}

interface NumberFieldCreate {
  field_type: 'number';
  field_key: string;
  label: string;
  is_required?: boolean;
  order_index?: number;
  min_value?: number;
  max_value?: number;
  default_value?: number;
}

interface ChoiceFieldCreate {
  field_type: 'choice';
  field_key: string;
  label: string;
  is_required?: boolean;
  order_index?: number;
  choices: string[];
  multiple?: boolean;
  default_value?: string | string[];
}

type FieldCreate = TextFieldCreate | NumberFieldCreate | ChoiceFieldCreate;

interface FormCreate {
  project_id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  fields?: FieldCreate[];
}

interface FormUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

interface TextFieldUpdate {
  field_type: 'text';
  field_key?: string;
  label?: string;
  is_required?: boolean;
  order_index?: number;
  max_length?: number;
  default_value?: string;
}

interface NumberFieldUpdate {
  field_type: 'number';
  field_key?: string;
  label?: string;
  is_required?: boolean;
  order_index?: number;
  min_value?: number;
  max_value?: number;
  default_value?: number;
}

interface ChoiceFieldUpdate {
  field_type: 'choice';
  field_key?: string;
  label?: string;
  is_required?: boolean;
  order_index?: number;
  choices?: string[];
  multiple?: boolean;
  default_value?: string | string[];
}

type FieldUpdate = TextFieldUpdate | NumberFieldUpdate | ChoiceFieldUpdate;
```
