# CURL Requests for Widget Feedback Testing

This document contains curl requests to test the different widget types with their specific data requirements.

## Base URL
Replace `YOUR_BASE_URL` with your actual server URL (e.g., `http://localhost:8000`)

## 1. Review Widget

### Submit Review Feedback
```bash
curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "widgetKey": "widget_abc123",
    "widgetType": "REVIEW",
    "overall_rating": 5,
    "title": "Great Product!",
    "message": "This product exceeded my expectations.",
    "pros": "Easy to use, great features, excellent support",
    "cons": "Could use more customization options"
  }'
```

## 2. Bug Report Widget

### Submit Bug Report
```bash
curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Note**: Valid severity values are: `"low"`, `"medium"`, `"high"`, `"critical"` (case-insensitive)

## 3. Feature Request Widget

### Submit Feature Request
```bash
curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "widgetKey": "widget_abc123",
    "widgetType": "FEATURE_REQUEST",
    "title": "Dark mode support",
    "description": "Add dark mode theme option for better user experience",
    "suggested_solution": "Add a theme toggle in settings with light/dark options",
    "benefits": "Reduces eye strain, improves accessibility, modern UI trend",
    "use_case": "Users working in low-light environments"
  }'
```

## 4. NPS Widget

### Submit NPS Feedback
```bash
curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "widgetKey": "widget_abc123",
    "widgetType": "NPS",
    "score": 9,
    "comment": "Very satisfied with the product and would recommend it to others."
  }'
```

### Submit NPS Feedback (Detractor)
```bash
curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "widgetKey": "widget_abc123",
    "widgetType": "NPS",
    "score": 3,
    "comment": "The product is okay but needs improvement."
  }'
```

### Submit NPS Feedback (without widgetType - uses widget's configured type)
```bash
curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "widgetKey": "widget_abc123",
    "score": 9,
    "comment": "Very satisfied with the product and would recommend it to others."
  }'
```

## 5. CSAT Widget

### Submit CSAT Feedback
```bash
curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "widgetKey": "widget_abc123",
    "widgetType": "CSAT",
    "score": 5,
    "comment": "Extremely satisfied with the customer service experience."
  }'
```

### Submit CSAT Feedback (Dissatisfied)
```bash
curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "widgetKey": "widget_abc123",
    "widgetType": "CSAT",
    "score": 2,
    "comment": "Not satisfied with the response time."
  }'
```

## 6. CES Widget

### Submit CES Feedback
```bash
curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "widgetKey": "widget_abc123",
    "widgetType": "CES",
    "score": 4,
    "comment": "It was quite easy to find the help I needed."
  }'
```

### Submit CES Feedback (Difficult)
```bash
curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "widgetKey": "widget_abc123",
    "widgetType": "CES",
    "score": 2,
    "comment": "It was difficult to find the right information."
  }'
```

## 7. Get Widget Configuration

### Get Widget Config
```bash
curl -X GET "YOUR_BASE_URL/api/v1/public/widgets/widget_abc123" \
  -H "Content-Type: application/json"
```

## 8. Test with Different Scores

### NPS Score Range (0-10)
```bash
# Test all NPS scores
for score in {0..10}; do
  curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
    -H "Content-Type: application/json" \
    -d "{
      \"widgetKey\": \"widget_abc123\",
      \"widgetType\": \"NPS\",
      \"score\": $score,
      \"comment\": \"Test score $score\"
    }"
  echo "Submitted NPS score: $score"
done
```

### CSAT Score Range (1-5)
```bash
# Test all CSAT scores
for score in {1..5}; do
  curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
    -H "Content-Type: application/json" \
    -d "{
      \"widgetKey\": \"widget_abc123\",
      \"widgetType\": \"CSAT\",
      \"score\": $score,
      \"comment\": \"Test score $score\"
    }"
  echo "Submitted CSAT score: $score"
done
```

### CES Score Range (1-5)
```bash
# Test all CES scores
for score in {1..5}; do
  curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
    -H "Content-Type: application/json" \
    -d "{
      \"widgetKey\": \"widget_abc123\",
      \"widgetType\": \"CES\",
      \"score\": $score,
      \"comment\": \"Test score $score\"
    }"
  echo "Submitted CES score: $score"
done
```

## 9. Test with Additional Context

### Submit with Submitter Info
```bash
curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "widgetKey": "widget_abc123",
    "widgetType": "NPS",
    "score": 8,
    "comment": "Great product!",
    "submitter_name": "John Doe",
    "submitter_email": "john@example.com",
    "context": {
      "page_url": "https://example.com/product",
      "user_id": "user123"
    }
  }'
```

## 10. Error Testing

### Invalid NPS Score
```bash
curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "widgetKey": "widget_abc123",
    "widgetType": "NPS",
    "score": 15,
    "comment": "This should fail"
  }'
```

### Invalid CSAT Score
```bash
curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "widgetKey": "widget_abc123",
    "widgetType": "CSAT",
    "score": 0,
    "comment": "This should fail"
  }'
```

### Missing Required Fields
```bash
curl -X POST "YOUR_BASE_URL/api/v1/public/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "widgetKey": "widget_abc123",
    "widgetType": "BUG_REPORT",
    "title": "Bug report without description"
  }'
```

## Expected Responses

### Successful Response
```json
{
  "id": "uuid-here",
  "widget_id": "widget-uuid",
  "project_id": "project-uuid",
  "feedback_type": "nps",
  "status": "new",
  "priority": "medium",
  "title": "NPS Survey Response",
  "message": "Very satisfied with the product and would recommend it to others.",
  "nps_score": 9,
  "promoter_category": "promoter",
  "follow_up_comment": "Very satisfied with the product and would recommend it to others.",
  "is_anonymous": true,
  "is_internal": false,
  "created_at": "2025-08-21T17:00:00Z",
  "updated_at": "2025-08-21T17:00:00Z"
}
```

### Error Response
```json
{
  "detail": "NPS score must be an integer between 0 and 10"
}
```

## Valid Field Values

### Severity Levels (for Bug Reports)
- `"low"` - Low priority bug
- `"medium"` - Medium priority bug (default)
- `"high"` - High priority bug
- `"critical"` - Critical priority bug

**Note**: Severity levels are only used for bug reports. Other feedback types (reviews, feature requests, NPS, CSAT, CES) do not have priority/severity fields.

### Rating Values
- **Review Widget**: `1` to `5` (5-star rating system) - use `overall_rating` field
- **NPS Widget**: `0` to `10` (Net Promoter Score)
- **CSAT Widget**: `1` to `5` (Customer Satisfaction)
- **CES Widget**: `1` to `5` (Customer Effort Score)

### Widget Types
- `"REVIEW"` - 5-star rating system (use `overall_rating` field)
- `"BUG_REPORT"` - Detailed bug reporting
- `"FEATURE_REQUEST"` - Feature requests with solution/benefits
- `"NPS"` - Net Promoter Score (0-10)
- `"CSAT"` - Customer Satisfaction (1-5)
- `"CES"` - Customer Effort Score (1-5)

## Simple Voting System

The feedback system now uses a simple integer counter for votes instead of complex upvote/downvote tracking:

```bash
# Upvote a feedback item (increments the feedback_votes counter)
curl -X POST "YOUR_BASE_URL/api/v1/feedback/{feedback_id}/upvote" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "feedback_votes": 5
}
```

## Notes

1. Replace `widget_abc123` with an actual widget public key from your database
2. The `widgetType` field is optional - if not provided, the system will use the widget's configured type
3. If an invalid `widgetType` is provided, the system will fall back to the widget's configured type
4. The server will automatically categorize:
   - NPS scores: 9-10 (promoter), 7-8 (passive), 0-6 (detractor)
   - CSAT scores: 1 (very_dissatisfied), 2 (dissatisfied), 3 (neutral), 4 (satisfied), 5 (very_satisfied)
   - CES scores: 1 (very_difficult), 2 (difficult), 3 (neutral), 4 (easy), 5 (very_easy)
5. All feedback is stored with context including IP address, user agent, and referer
6. The system automatically validates score ranges and required fields

## Widget Type Handling

The system supports these widget types:
- `REVIEW` - 5-star rating system (use `overall_rating` field)
- `BUG_REPORT` - Detailed bug reporting
- `FEATURE_REQUEST` - Feature requests with solution/benefits
- `NPS` - Net Promoter Score (0-10)
- `CSAT` - Customer Satisfaction (1-5)
- `CES` - Customer Effort Score (1-5)

If you don't specify `widgetType` in your request, the system will use the widget's configured type from the database.
