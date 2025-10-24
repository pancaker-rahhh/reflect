from app.models.feedback_model import Feedback
from typing import Optional


class FeedbackFormatter:
    TITLE_MAX_LENGTH = 50
    MESSAGE_PREVIEW_LENGTH = 30
    SCORE_TYPES = ['NPS', 'CSAT', 'CES']

    @staticmethod
    def format_display_title(item: Feedback) -> str:
        content = item.message

        if not content or content.strip() == '':
            if item.feedback_type.value in ['review', 'NPS', 'CSAT', 'CES']:
                rating = FeedbackFormatter._get_effective_rating(item)
                if rating is not None:
                    return f'Rating: {rating}'
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
    def _get_effective_rating(item) -> Optional[int]:
        """Returns the appropriate rating value based on feedback type"""
        try:
            # Check for rating attributes directly
            if hasattr(item, 'overall_rating') and item.overall_rating is not None:
                return item.overall_rating
            elif hasattr(item, 'nps_score') and item.nps_score is not None:
                return item.nps_score
            elif hasattr(item, 'csat_score') and item.csat_score is not None:
                return item.csat_score
            elif hasattr(item, 'ces_score') and item.ces_score is not None:
                return item.ces_score

            # If no rating found, return None (will fall back to "Submitted" text)
            return None
        except Exception:
            return None
