from app.models.feedback_model import Feedback, FeedbackType
from typing import Optional


class FeedbackFormatter:
    TITLE_MAX_LENGTH = 50
    MESSAGE_PREVIEW_LENGTH = 30
    SCORE_TYPES = ['NPS', 'CSAT', 'CES']

    @staticmethod
    def format_display_title(item: Feedback) -> str:
        content = item.message

        if not content or content.strip() == '':
            rating = FeedbackFormatter._get_effective_rating(item)
            if rating is not None:
                return f'Rating: {rating}'
            else:
                return f'{item.feedback_type.value.replace("_", " ").title()} Submitted'

        if content.startswith('New '):
            content = content[4:]

        if len(content) > FeedbackFormatter.TITLE_MAX_LENGTH:
            content = content[: FeedbackFormatter.TITLE_MAX_LENGTH] + '...'

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

    @staticmethod
    def _get_effective_rating(item: Feedback) -> Optional[int]:
        try:
            if item.feedback_type == FeedbackType.REVIEW:
                return getattr(item, 'overall_rating', item.rating)
            elif item.feedback_type == FeedbackType.NPS:
                return getattr(item, 'nps_score', item.rating)
            elif item.feedback_type == FeedbackType.CSAT:
                return getattr(item, 'csat_score', item.rating)
            elif item.feedback_type == FeedbackType.CES:
                return getattr(item, 'ces_score', item.rating)
            return item.rating
        except Exception:
            return item.rating
