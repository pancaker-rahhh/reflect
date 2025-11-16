import re
import html
from typing import Any, Dict, Optional, Union


class InputSanitizer:
    ALLOWED_HTML_TAGS = {
        'b',
        'strong',
        'i',
        'em',
        'u',
        'br',
        'p',
        'ul',
        'ol',
        'li',
        'code',
        'pre',
    }

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

    @classmethod
    def sanitize_text(
        cls, text: Optional[str], max_length: Optional[int] = None
    ) -> Optional[str]:
        if not text:
            return text
        text = str(text).strip()
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
        text = html.escape(text)
        text = cls._restore_safe_html(text)

        if max_length:
            text = text[:max_length]

        return text

    @classmethod
    def _restore_safe_html(cls, text: str) -> str:
        safe_patterns = [
            (r'&lt;b&gt;', '<b>'),
            (r'&lt;/b&gt;', '</b>'),
            (r'&lt;strong&gt;', '<strong>'),
            (r'&lt;/strong&gt;', '</strong>'),
            (r'&lt;i&gt;', '<i>'),
            (r'&lt;/i&gt;', '</i>'),
            (r'&lt;em&gt;', '<em>'),
            (r'&lt;/em&gt;', '</em>'),
            (r'&lt;u&gt;', '<u>'),
            (r'&lt;/u&gt;', '</u>'),
            (r'&lt;br&gt;', '<br>'),
            (r'&lt;p&gt;', '<p>'),
            (r'&lt;/p&gt;', '</p>'),
            (r'&lt;ul&gt;', '<ul>'),
            (r'&lt;/ul&gt;', '</ul>'),
            (r'&lt;ol&gt;', '<ol>'),
            (r'&lt;/ol&gt;', '</ol>'),
            (r'&lt;li&gt;', '<li>'),
            (r'&lt;/li&gt;', '</li>'),
            (r'&lt;code&gt;', '<code>'),
            (r'&lt;/code&gt;', '</code>'),
            (r'&lt;pre&gt;', '<pre>'),
            (r'&lt;/pre&gt;', '</pre>'),
        ]

        for pattern, replacement in safe_patterns:
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

        return text

    @classmethod
    def sanitize_email(cls, email: Optional[str]) -> Optional[str]:
        if not email:
            return email

        email = str(email).strip().lower()

        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

        if not re.match(email_pattern, email):
            return None

        return email[:254]

    @classmethod
    def sanitize_url(cls, url: Optional[str]) -> Optional[str]:
        if not url:
            return url

        url = str(url).strip()

        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url

        try:
            if len(url) > 2048:
                return None
            return url
        except Exception:
            return None

    @classmethod
    def sanitize_rating(cls, rating: Optional[Union[int, float]]) -> Optional[int]:
        if rating is None:
            return None

        try:
            rating = int(float(rating))

            if 1 <= rating <= 10:
                return rating
        except (ValueError, TypeError):
            pass

        return None

    @classmethod
    def sanitize_severity(cls, severity: Optional[str]) -> Optional[str]:
        if not severity:
            return None

        severity = str(severity).strip().lower()
        allowed_values = {'low', 'medium', 'high', 'critical'}

        return severity if severity in allowed_values else 'medium'

    @classmethod
    def sanitize_priority(cls, priority: Optional[str]) -> Optional[str]:
        if not priority:
            return None

        priority = str(priority).strip().lower()
        allowed_values = {'low', 'medium', 'high', 'urgent'}

        return priority if priority in allowed_values else 'medium'

    @classmethod
    def sanitize_category(cls, category: Optional[str]) -> Optional[str]:
        if not category:
            return None

        category = str(category).strip()

        category = re.sub(r'[^\w\s-]', '', category)
        category = category[:50]

        return category if category else None

    @classmethod
    def sanitize_feedback_data(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        sanitized = {}

        for field, value in data.items():
            if value is None:
                continue

            if field in cls.MAX_LENGTHS:
                max_length = cls.MAX_LENGTHS[field]

                if field == 'submitter_email':
                    sanitized[field] = cls.sanitize_email(value)
                elif field in [
                    'score',
                    'overall_rating',
                    'nps_score',
                    'csat_score',
                    'ces_score',
                ]:
                    sanitized[field] = cls.sanitize_rating(value)
                elif field == 'severity':
                    sanitized[field] = cls.sanitize_severity(value)
                elif field == 'priority':
                    sanitized[field] = cls.sanitize_priority(value)
                elif field == 'category':
                    sanitized[field] = cls.sanitize_category(value)
                elif field in ['visual_proof', 'context'] and isinstance(value, dict):
                    sanitized[field] = cls.sanitize_feedback_data(value)
                else:
                    sanitized[field] = cls.sanitize_text(value, max_length)
            else:
                if isinstance(value, str):
                    sanitized[field] = cls.sanitize_text(value, 1000)
                elif isinstance(value, dict):
                    sanitized[field] = cls.sanitize_feedback_data(value)
                else:
                    sanitized[field] = value

        return sanitized

    @classmethod
    def sanitize_widget_key(cls, widget_key: Optional[str]) -> Optional[str]:
        if not widget_key:
            return None

        widget_key = str(widget_key).strip()

        if re.match(r'^[a-zA-Z0-9_]+$', widget_key):
            return widget_key

        return None
