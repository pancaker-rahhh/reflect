from app.core.sanitization import InputSanitizer


class TestSanitizeText:
    def test_removes_control_characters(self):
        text = 'Hello\x00\x01\x02World'
        result = InputSanitizer.sanitize_text(text)
        assert '\x00' not in result
        assert '\x01' not in result
        assert '\x02' not in result
        assert 'Hello' in result and 'World' in result

    def test_escapes_html_entities(self):
        text = '<script>alert("XSS")</script>'
        result = InputSanitizer.sanitize_text(text)
        assert '<script>' not in result
        assert '&lt;script&gt;' in result or '&lt;' in result

    def test_restores_safe_html_tags(self):
        text = '<b>Bold</b> <strong>Strong</strong> <i>Italic</i>'
        result = InputSanitizer.sanitize_text(text)
        assert '<b>Bold</b>' in result
        assert '<strong>Strong</strong>' in result
        assert '<i>Italic</i>' in result

    def test_enforces_max_length(self):
        text = 'A' * 1000
        result = InputSanitizer.sanitize_text(text, max_length=100)
        assert len(result) <= 100

    def test_handles_none(self):
        result = InputSanitizer.sanitize_text(None)
        assert result is None

    def test_handles_empty_string(self):
        result = InputSanitizer.sanitize_text('')
        assert result == '' or result is None

    def test_strips_whitespace(self):
        text = '  Hello World  '
        result = InputSanitizer.sanitize_text(text)
        assert result == 'Hello World'


class TestSanitizeEmail:
    def test_valid_email_formats(self):
        valid_emails = [
            'test@example.com',
            'user.name@example.co.uk',
            'user+tag@example.com',
        ]
        for email in valid_emails:
            result = InputSanitizer.sanitize_email(email)
            assert result == email.lower().strip()

    def test_invalid_email_rejection(self):
        invalid_emails = [
            'not-an-email',
            '@example.com',
            'test@',
            'test@.com',
            'test..test@example.com',
        ]
        for email in invalid_emails:
            result = InputSanitizer.sanitize_email(email)
            assert result is None

    def test_truncation_to_254_chars(self):
        long_email = 'a' * 250 + '@example.com'
        result = InputSanitizer.sanitize_email(long_email)
        assert result is not None
        assert len(result) <= 254

    def test_lowercase_conversion(self):
        email = 'Test@Example.COM'
        result = InputSanitizer.sanitize_email(email)
        assert result == 'test@example.com'

    def test_handles_none(self):
        result = InputSanitizer.sanitize_email(None)
        assert result is None


class TestSanitizeUrl:
    def test_adds_https_prefix(self):
        url = 'example.com'
        result = InputSanitizer.sanitize_url(url)
        assert result.startswith('https://')

    def test_preserves_http_urls(self):
        url = 'http://example.com'
        result = InputSanitizer.sanitize_url(url)
        assert result == url

    def test_url_length_limit(self):
        long_url = 'https://example.com/' + 'a' * 2050
        result = InputSanitizer.sanitize_url(long_url)
        assert result is None

    def test_handles_none(self):
        result = InputSanitizer.sanitize_url(None)
        assert result is None


class TestSanitizeRating:
    def test_valid_range(self):
        for rating in range(0, 11):
            result = InputSanitizer.sanitize_rating(rating)
            assert result == rating

    def test_invalid_values_return_none(self):
        invalid_ratings = [-1, 11, 100, 'not a number']
        for rating in invalid_ratings:
            result = InputSanitizer.sanitize_rating(rating)
            assert result is None

    def test_handles_float_conversion(self):
        result = InputSanitizer.sanitize_rating(5.7)
        assert result == 5

    def test_handles_none(self):
        result = InputSanitizer.sanitize_rating(None)
        assert result is None


class TestSanitizeSeverity:
    def test_valid_values(self):
        valid_values = ['low', 'medium', 'high', 'critical']
        for value in valid_values:
            result = InputSanitizer.sanitize_severity(value)
            assert result == value

    def test_case_insensitive(self):
        result = InputSanitizer.sanitize_severity('HIGH')
        assert result == 'high'

    def test_invalid_defaults_to_medium(self):
        result = InputSanitizer.sanitize_severity('invalid')
        assert result == 'medium'

    def test_handles_none(self):
        result = InputSanitizer.sanitize_severity(None)
        assert result is None


class TestSanitizePriority:
    def test_valid_values(self):
        valid_values = ['low', 'medium', 'high', 'urgent']
        for value in valid_values:
            result = InputSanitizer.sanitize_priority(value)
            assert result == value

    def test_invalid_defaults_to_medium(self):
        result = InputSanitizer.sanitize_priority('invalid')
        assert result == 'medium'

    def test_handles_none(self):
        result = InputSanitizer.sanitize_priority(None)
        assert result is None


class TestSanitizeCategory:
    def test_removes_special_characters(self):
        category = 'category!@#$%^&*()'
        result = InputSanitizer.sanitize_category(category)
        assert '!' not in result
        assert '@' not in result

    def test_length_limit(self):
        long_category = 'a' * 100
        result = InputSanitizer.sanitize_category(long_category)
        assert len(result) <= 50

    def test_preserves_alphanumeric_and_hyphens(self):
        category = 'category-123_test'
        result = InputSanitizer.sanitize_category(category)
        assert 'category' in result.lower()

    def test_handles_none(self):
        result = InputSanitizer.sanitize_category(None)
        assert result is None


class TestSanitizeWidgetKey:
    def test_valid_alphanumeric_and_underscore(self):
        valid_keys = ['widget123', 'test_widget', 'Widget_123']
        for key in valid_keys:
            result = InputSanitizer.sanitize_widget_key(key)
            assert result is not None

    def test_invalid_characters_rejected(self):
        invalid_keys = [
            'widget-key',
            'widget key',
            'widget@key',
            'widget.key',
        ]
        for key in invalid_keys:
            result = InputSanitizer.sanitize_widget_key(key)
            assert result is None

    def test_handles_none(self):
        result = InputSanitizer.sanitize_widget_key(None)
        assert result is None

    def test_handles_empty_string(self):
        result = InputSanitizer.sanitize_widget_key('')
        assert result is None


class TestSanitizeFeedbackData:
    def test_recursive_sanitization(self):
        data = {
            'message': '<script>alert("XSS")</script>',
            'context': {'nested': '<b>Bold</b>', 'deep': {'value': 'test'}},
        }
        result = InputSanitizer.sanitize_feedback_data(data)
        assert '<script>' not in result['message']
        assert '<b>Bold</b>' in result['context']['nested']

    def test_handles_all_field_types(self):
        data = {
            'message': 'Test message',
            'submitter_email': 'test@example.com',
            'overall_rating': 5,
            'severity': 'high',
            'priority': 'urgent',
            'category': 'bug',
        }
        result = InputSanitizer.sanitize_feedback_data(data)
        assert result['message'] == 'Test message'
        assert result['submitter_email'] == 'test@example.com'
        assert result['overall_rating'] == 5
        assert result['severity'] == 'high'
        assert result['priority'] == 'urgent'

    def test_handles_none_values(self):
        data = {
            'message': None,
            'rating': None,
        }
        result = InputSanitizer.sanitize_feedback_data(data)
        assert result == {}


class TestSecurityAttacks:
    def test_xss_script_tags(self):
        xss_payloads = [
            '<script>alert("XSS")</script>',
            '<img src=x onerror=alert("XSS")>',
            '<svg onload=alert("XSS")>',
        ]
        for payload in xss_payloads:
            result = InputSanitizer.sanitize_text(payload)
            assert '<script' not in result.lower()

    def test_sql_injection_attempts(self):
        sql_payloads = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "'; INSERT INTO users VALUES('hacker'); --",
        ]
        for payload in sql_payloads:
            result = InputSanitizer.sanitize_text(payload)
            assert isinstance(result, str)

    def test_unicode_special_characters(self):
        unicode_text = 'Hello 世界 🌍'
        result = InputSanitizer.sanitize_text(unicode_text)
        assert result is not None
        assert isinstance(result, str)
