# Input Sanitization Guide

This guide covers the comprehensive input sanitization system implemented across both backend and frontend to prevent XSS and injection attacks.

## Overview

The sanitization system provides:
- **Backend sanitization**: Automatic cleaning of all user input in feedback endpoints
- **Frontend sanitization**: Reusable components and utilities for input validation
- **XSS protection**: HTML escaping and safe tag filtering
- **Length validation**: Configurable maximum lengths for different field types
- **Type validation**: Specific validation for emails, URLs, ratings, etc.

## Backend Implementation

### Core Sanitization Module

Located at `api/server/app/core/sanitization.py`, this module provides:

```python
from app.core.sanitization import InputSanitizer

# Sanitize text input
clean_text = InputSanitizer.sanitize_text(user_input, max_length=200)

# Sanitize email
clean_email = InputSanitizer.sanitize_email(user_email)

# Sanitize entire feedback data
clean_data = InputSanitizer.sanitize_feedback_data(feedback_dict)
```

### Field-Specific Sanitization

- **Text fields**: HTML escaping, length limiting, control character removal
- **Email fields**: Format validation, length limiting (max 254 chars)
- **URL fields**: Protocol validation, length limiting (max 2048 chars)
- **Rating fields**: Range validation (0-10), type conversion
- **Enum fields**: Severity, priority, category validation against allowed values

### Maximum Lengths

```python
MAX_LENGTHS = {
    'title': 200,
    'message': 2000,
    'description': 5000,
    'pros': 1000,
    'cons': 1000,
    'steps_to_reproduce': 2000,
    'expected_result': 1000,
    'actual_result': 1000,
    'suggested_solution': 2000,
    'benefits': 1000,
    'use_case': 1000,
    'comment': 1000,
    'submitter_name': 100,
    'submitter_email': 254,
    'category': 50,
    'priority': 20,
    'severity': 20,
}
```

### Safe HTML Tags

The system allows these HTML tags in feedback content:
```python
ALLOWED_HTML_TAGS = {
    'b', 'strong', 'i', 'em', 'u', 'br', 'p', 
    'ul', 'ol', 'li', 'code', 'pre'
}
```

## Frontend Implementation

### Sanitization Utility

Located at `client/src/lib/sanitization.ts`, provides:

```typescript
import { InputSanitizer, sanitizeInput } from '@/lib/sanitization';

// Sanitize text
const cleanText = InputSanitizer.sanitizeText(userInput, { maxLength: 200 });

// Convenience functions
const cleanTitle = sanitizeInput.title(userInput);
const cleanEmail = sanitizeInput.email(userInput);
const cleanRating = sanitizeInput.overall_rating(userInput);
```

### Reusable Components

Located at `client/src/components/ui/SanitizedInput.tsx`:

```tsx
import { 
  SanitizedInput, 
  SanitizedTitleInput, 
  SanitizedMessageInput,
  SanitizedCommentInput,
  SanitizedEmailInput 
} from '@/components/ui/SanitizedInput';

// Basic usage
<SanitizedInput
  label="Title"
  fieldType="title"
  showCharCount
  onSanitizedChange={(original, sanitized) => {
    console.log('Input sanitized:', { original, sanitized });
  }}
/>

// Field-specific components
<SanitizedTitleInput label="Title" showCharCount />
<SanitizedMessageInput label="Message" showCharCount />
<SanitizedCommentInput label="Comment" showCharCount />
<SanitizedEmailInput label="Email" />
```

### Custom Sanitization Options

```tsx
<SanitizedInput
  label="Custom Input"
  sanitizationOptions={{
    maxLength: 500,
    allowHtml: true,
    allowedTags: ['b', 'i', 'strong'],
    stripNewlines: true,
    trimWhitespace: true,
  }}
/>
```

### Hook Usage

```tsx
import { useSanitizedInput } from '@/components/ui/SanitizedInput';

function MyComponent() {
  const titleInput = useSanitizedInput('title');
  
  return (
    <div>
      <input
        value={titleInput.value}
        onChange={(e) => titleInput.handleChange(e.target.value)}
      />
      <span>{titleInput.charCount}/{titleInput.maxLength}</span>
      {titleInput.isExceeding && (
        <span className="text-red-500">
          {titleInput.remainingChars} characters over limit
        </span>
      )}
    </div>
  );
}
```

## Usage Examples

### Backend Endpoint

```python
@public_router.post('/feedback')
async def submit_feedback(payload: PublicFeedbackPayload):
    # Sanitize widget key
    sanitized_widget_key = InputSanitizer.sanitize_widget_key(payload.widgetKey)
    if not sanitized_widget_key:
        raise HTTPException(status_code=400, detail='Invalid widget key')
    
    # Sanitize all feedback data
    sanitized_data = InputSanitizer.sanitize_feedback_data(payload.model_dump())
    
    # Process sanitized data
    return await feedback_service.create_feedback(sanitized_data)
```

### Frontend Form

```tsx
function FeedbackForm() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Data is already sanitized by the components
    const sanitizedData = {
      title: formData.title, // Already sanitized
      message: formData.message, // Already sanitized
      email: formData.email, // Already sanitized
    };
    
    submitFeedback(sanitizedData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <SanitizedTitleInput
        label="Title"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        showCharCount
      />
      
      <SanitizedMessageInput
        label="Message"
        value={formData.message}
        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
        showCharCount
      />
      
      <SanitizedEmailInput
        label="Email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
      />
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Security Features

### XSS Prevention
- HTML escaping of all user input
- Safe HTML tag filtering
- Script tag removal
- Event handler attribute removal

### Injection Prevention
- Control character removal
- Null byte filtering
- Length limiting
- Type validation

### Data Validation
- Email format validation
- URL structure validation
- Rating range validation
- Enum value validation

## Testing

### Backend Testing

```bash
cd api/server
poetry run python -m py_compile app/core/sanitization.py
poetry run python -c "from app.core.sanitization import InputSanitizer; print('Sanitizer imported successfully')"
```

### Frontend Testing

```tsx
// Test XSS prevention
const testInput = '<script>alert("xss")</script>Hello World';
const sanitized = InputSanitizer.sanitizeText(testInput);
console.log(sanitized); // Should output: "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;Hello World"

// Test length limiting
const longInput = 'a'.repeat(300);
const limited = InputSanitizer.sanitizeText(longInput, { maxLength: 200 });
console.log(limited.length); // Should be 200
```

## Migration Guide

### Existing Components

To add sanitization to existing input components:

1. **Replace standard inputs**:
```tsx
// Before
<input value={title} onChange={handleTitleChange} />

// After
<SanitizedTitleInput value={title} onChange={handleTitleChange} showCharCount />
```

2. **Add sanitization to forms**:
```tsx
// Before
const handleSubmit = () => {
  submitData(formData);
};

// After
const handleSubmit = () => {
  // Data is automatically sanitized by components
  submitData(formData);
};
```

3. **Update validation logic**:
```tsx
// Before
if (title.length > 200) {
  setError('Title too long');
}

// After
// Length validation is handled automatically by SanitizedInput
```

### Backend Endpoints

To add sanitization to existing endpoints:

1. **Import sanitizer**:
```python
from app.core.sanitization import InputSanitizer
```

2. **Sanitize input data**:
```python
# Before
feedback_data = payload.model_dump()

# After
feedback_data = InputSanitizer.sanitize_feedback_data(payload.model_dump())
```

3. **Validate sanitized data**:
```python
if not feedback_data.get('title'):
    raise HTTPException(status_code=400, detail='Title is required')
```

## Best Practices

1. **Always use sanitized components** for user input
2. **Validate on both frontend and backend** for security
3. **Log sanitization actions** for debugging
4. **Test with malicious input** to ensure protection
5. **Keep sanitization rules updated** as requirements change
6. **Use field-specific components** for better UX
7. **Show character counts** for better user experience
8. **Handle sanitization errors** gracefully

## Troubleshooting

### Common Issues

1. **Input not being sanitized**: Check if using SanitizedInput components
2. **Length validation not working**: Verify maxLength is set correctly
3. **HTML not being escaped**: Ensure allowHtml is false (default)
4. **Sanitization errors**: Check console for validation errors

### Debug Mode

Enable debug logging to see sanitization in action:

```tsx
<SanitizedInput
  onSanitizedChange={(original, sanitized) => {
    console.log('Sanitization:', { original, sanitized });
  }}
/>
```

## Performance Considerations

- Sanitization happens on every input change
- For large forms, consider debouncing sanitization
- Sanitized values are cached in component state
- Backend sanitization is optimized for bulk processing

## Future Enhancements

- [ ] DOMPurify integration for advanced HTML sanitization
- [ ] Custom sanitization rules per project
- [ ] Sanitization analytics and reporting
- [ ] Real-time sanitization preview
- [ ] Batch sanitization for large datasets
