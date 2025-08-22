# Widget Feedback System Guide

This guide explains how to use the enhanced widget feedback system that properly handles different widget types with their specific data requirements.

## Overview

The widget feedback system now supports different widget types with specialized data storage:

1. **Review Widgets** - 5-star rating system with pros/cons
2. **Bug Report Widgets** - Detailed bug reporting with steps to reproduce
3. **Feature Request Widgets** - Feature requests with solution suggestions and benefits
4. **NPS Widgets** - Net Promoter Score (0-10 scale)
5. **CSAT Widgets** - Customer Satisfaction (1-5 scale)
6. **CES Widgets** - Customer Effort Score (1-5 scale)

## Widget Types and Data Requirements

### 1. Review Widget (`REVIEW`)

**Purpose**: Collect product reviews with 5-star ratings

**Required Data**:
- `rating`: Integer (1-5) - Overall rating
- `title`: String (optional) - Review title
- `message`: String (optional) - Review content
- `pros`: String (optional) - What the user liked
- `cons`: String (optional) - What the user didn't like

**Example**:
```json
{
  "widgetKey": "widget_abc123",
  "widgetType": "REVIEW",
  "rating": 5,
  "title": "Great Product!",
  "message": "This product exceeded my expectations.",
  "pros": "Easy to use, great features, excellent support",
  "cons": "Could use more customization options"
}
```

### 2. Bug Report Widget (`BUG_REPORT`)

**Purpose**: Collect detailed bug reports from users

**Required Data**:
- `title`: String - Bug title
- `description`: String - Bug description
- `severity`: String - Severity level (low, medium, high, critical)
- `steps_to_reproduce`: String - Steps to reproduce the bug
- `expected_result`: String - What should happen
- `actual_result`: String - What actually happens
- `visual_proof`: Object (optional) - Screenshots or attachments

**Example**:
```json
{
  "widgetKey": "widget_abc123",
  "widgetType": "BUG_REPORT",
  "title": "Login button not working",
  "description": "Users cannot log in using the login button",
  "severity": "high",
  "steps_to_reproduce": "1. Go to login page\n2. Enter credentials\n3. Click login button",
  "expected_result": "User should be logged in and redirected to dashboard",
  "actual_result": "Button does nothing, no error message shown",
  "visual_proof": {
    "screenshots": ["https://example.com/screenshot1.png"]
  }
}
```

### 3. Feature Request Widget (`FEATURE_REQUEST`)

**Purpose**: Collect feature requests with detailed information

**Required Data**:
- `title`: String - Feature request title
- `description`: String - Feature description
- `suggested_solution`: String - How the feature could be implemented
- `benefits`: String - Benefits of this feature
- `use_case`: String (optional) - Use case description

**Example**:
```json
{
  "widgetKey": "widget_abc123",
  "widgetType": "FEATURE_REQUEST",
  "title": "Dark mode support",
  "description": "Add dark mode theme option for better user experience",
  "suggested_solution": "Add a theme toggle in settings with light/dark options",
  "benefits": "Reduces eye strain, improves accessibility, modern UI trend",
  "use_case": "Users working in low-light environments"
}
```

### 4. NPS Widget (`NPS`)

**Purpose**: Collect Net Promoter Score (0-10 scale)

**Required Data**:
- `score`: Integer (0-10) - NPS score
- `comment`: String (optional) - Follow-up comment

**Example**:
```json
{
  "widgetKey": "widget_abc123",
  "widgetType": "NPS",
  "score": 9,
  "comment": "Very satisfied with the product and would recommend it to others."
}
```

### 5. CSAT Widget (`CSAT`)

**Purpose**: Collect Customer Satisfaction Score (1-5 scale)

**Required Data**:
- `score`: Integer (1-5) - Satisfaction score
- `comment`: String (optional) - Follow-up comment

**Example**:
```json
{
  "widgetKey": "widget_abc123",
  "widgetType": "CSAT",
  "score": 5,
  "comment": "Extremely satisfied with the customer service experience."
}
```

### 6. CES Widget (`CES`)

**Purpose**: Collect Customer Effort Score (1-5 scale)

**Required Data**:
- `score`: Integer (1-5) - Effort score
- `comment`: String (optional) - Follow-up comment

**Example**:
```json
{
  "widgetKey": "widget_abc123",
  "widgetType": "CES",
  "score": 4,
  "comment": "It was quite easy to find the help I needed."
}
```

## API Usage

### Submit Feedback

**Endpoint**: `POST /api/v1/public/feedback`

**Request Body**: Use the appropriate data structure based on widget type (see examples above)

**Response**: Returns the created feedback object with type-specific fields

### Get Widget Configuration

**Endpoint**: `GET /api/v1/public/widgets/{public_key}`

**Response**: Returns widget configuration including type and settings

## Backend Implementation

### Using the Feedback Service

The backend provides a factory method to create appropriate feedback based on widget type:

```python
from app.services.feedback_service import feedback_service
from app.models.widget_model import WidgetType

# Create feedback using the factory method
feedback = await feedback_service.create_feedback_from_widget(
    db=db,
    widget_id=widget.id,
    project_id=widget.project_id,
    widget_type=WidgetType.REVIEW,
    data={
        'rating': 5,
        'title': 'Great Product!',
        'message': 'Excellent experience'
    }
)
```

### Using the Widget Feedback Handler

For more specific handling, use the dedicated handler:

```python
from app.services.widget_feedback_handler import widget_feedback_handler

# Handle review feedback
feedback = await widget_feedback_handler.handle_review_widget(
    db=db,
    widget_id=widget.id,
    project_id=widget.project_id,
    data={
        'rating': 5,
        'title': 'Great Product!',
        'message': 'Excellent experience',
        'pros': 'Easy to use',
        'cons': 'None'
    }
)
```

## Database Schema

The system uses polymorphic tables to store different feedback types:

- `feedback` - Base feedback table
- `review_feedback` - Review-specific data
- `bug_report_feedback` - Bug report-specific data
- `feature_request_feedback` - Feature request-specific data
- `nps_feedback` - NPS-specific data
- `csat_feedback` - CSAT-specific data
- `ces_feedback` - CES-specific data

## Scoring and Categorization

### NPS Scoring
- **Promoters**: 9-10
- **Passives**: 7-8
- **Detractors**: 0-6

### CSAT Satisfaction Levels
- **Very Dissatisfied**: 1
- **Dissatisfied**: 2
- **Neutral**: 3
- **Satisfied**: 4
- **Very Satisfied**: 5

### CES Ease Levels
- **Very Difficult**: 1
- **Difficult**: 2
- **Neutral**: 3
- **Easy**: 4
- **Very Easy**: 5

## Frontend Integration

### Widget Configuration

When creating a widget, specify the widget type:

```typescript
const widgetConfig = {
  name: "Customer Feedback",
  widget_type: "NPS", // or "REVIEW", "BUG_REPORT", etc.
  configuration: {
    content: {
      headerTitle: "We value your feedback",
      mainQuestion: "How likely are you to recommend our product?",
      submitButtonText: "Submit Rating"
    }
  }
};
```

### Submitting Feedback

Submit feedback with the appropriate data structure:

```typescript
const submitFeedback = async (data: any) => {
  const response = await fetch('/api/v1/public/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      widgetKey: 'widget_abc123',
      widgetType: 'NPS',
      score: 9,
      comment: 'Great product!'
    })
  });
  
  return response.json();
};
```

## Best Practices

1. **Validate Data**: Always validate widget type and required fields
2. **Handle Errors**: Provide meaningful error messages for invalid data
3. **Log Feedback**: Log all feedback submissions for debugging
4. **Rate Limiting**: Implement rate limiting to prevent spam
5. **Data Privacy**: Ensure sensitive data is handled appropriately
6. **Analytics**: Track feedback metrics for business insights

## Example Implementation

See `app/services/widget_feedback_handler.py` for complete implementation examples and the `WidgetFeedbackExamples` class for sample data structures.

## Migration

The system includes database migrations to add the new feedback tables. Run:

```bash
poetry run alembic upgrade head
```

This will create the necessary tables for storing different feedback types.
