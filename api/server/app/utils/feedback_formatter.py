from app.models.feedback_model import Feedback


class FeedbackFormatter:
    MESSAGE_PREVIEW_LENGTH = 30
    SCORE_TYPES = ['NPS', 'CSAT', 'CES']

    @staticmethod
    def format_display_title(item: Feedback) -> str:
        content = item.message

        if not content or content.strip() == '':
            if item.rating is not None:
                return f'Rating: {item.rating}'
            else:
                return f'{item.feedback_type.value.replace("_", " ").title()} Submitted'

        if content.startswith('New '):
            content = content[4:]

        return content

    @staticmethod
    def format_for_display(item: Feedback) -> dict:
        title = FeedbackFormatter.format_display_title(item)

        return {
            'id': str(item.id),
            'type': item.feedback_type.value
            if hasattr(item.feedback_type, 'value')
            else str(item.feedback_type),
            'summary': title,
            'message': item.message,
            'submittedBy': item.submitter_name or 'Anonymous',
            'timestamp': item.created_at.isoformat() if item.created_at else None,
            'feedback_votes': item.feedback_votes,
            'is_actionable': item.is_actionable,
        }
