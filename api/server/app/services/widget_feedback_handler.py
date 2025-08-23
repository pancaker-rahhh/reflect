"""
Widget Feedback Handler Service

This service demonstrates how to handle different widget types with their specific data requirements.
It provides examples and utilities for processing feedback from various widget types.
"""

from typing import Dict, Any, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.widget_model import WidgetType
from app.services.feedback_service import feedback_service
from app.core.logging import get_logger

logger = get_logger(__name__)


class WidgetFeedbackHandler:
    """
    Handles feedback submission from different widget types with their specific data requirements.
    """

    @staticmethod
    async def handle_review_widget(
        db: AsyncSession, widget_id: UUID, project_id: UUID, data: Dict[str, Any]
    ):
        """
        Handle review widget feedback (5-star rating system)

        Expected data:
        - rating: int (1-5)
        - title: str (optional)
        - message: str (optional)
        - pros: str (optional)
        - cons: str (optional)
        """
        logger.info(f'Processing review feedback for widget {widget_id}')

        feedback_data = {
            'rating': data.get('rating', 0),
            'title': data.get('title', 'Product Review'),
            'message': data.get('message', ''),
            'pros': data.get('pros', ''),
            'cons': data.get('cons', ''),
        }

        return await feedback_service.create_feedback_from_widget(
            db=db,
            widget_id=widget_id,
            project_id=project_id,
            widget_type=WidgetType.REVIEW,
            data=feedback_data,
        )

    @staticmethod
    async def handle_bug_report_widget(
        db: AsyncSession, widget_id: UUID, project_id: UUID, data: Dict[str, Any]
    ):
        """
        Handle bug report widget feedback

        Expected data:
        - title: str
        - description: str
        - severity: str (low, medium, high, critical)
        - steps_to_reproduce: str
        - expected_result: str
        - actual_result: str
        - visual_proof: dict (optional)
        """
        logger.info(f'Processing bug report feedback for widget {widget_id}')

        feedback_data = {
            'title': data.get('title', 'Bug Report'),
            'description': data.get('description', ''),
            'severity': data.get('severity', 'medium'),
            'steps_to_reproduce': data.get('steps_to_reproduce', ''),
            'expected_result': data.get('expected_result', ''),
            'actual_result': data.get('actual_result', ''),
            'visual_proof': data.get('visual_proof', {}),
        }

        return await feedback_service.create_feedback_from_widget(
            db=db,
            widget_id=widget_id,
            project_id=project_id,
            widget_type=WidgetType.BUG_REPORT,
            data=feedback_data,
        )

    @staticmethod
    async def handle_feature_request_widget(
        db: AsyncSession, widget_id: UUID, project_id: UUID, data: Dict[str, Any]
    ):
        """
        Handle feature request widget feedback

        Expected data:
        - title: str
        - description: str
        - suggested_solution: str
        - benefits: str
        - use_case: str (optional)
        """
        logger.info(f'Processing feature request feedback for widget {widget_id}')

        feedback_data = {
            'title': data.get('title', 'Feature Request'),
            'description': data.get('description', ''),
            'suggested_solution': data.get('suggested_solution', ''),
            'benefits': data.get('benefits', ''),
            'use_case': data.get('use_case', ''),
        }

        return await feedback_service.create_feedback_from_widget(
            db=db,
            widget_id=widget_id,
            project_id=project_id,
            widget_type=WidgetType.FEATURE_REQUEST,
            data=feedback_data,
        )

    @staticmethod
    async def handle_nps_widget(
        db: AsyncSession, widget_id: UUID, project_id: UUID, data: Dict[str, Any]
    ):
        """
        Handle NPS widget feedback (0-10 scale)

        Expected data:
        - score: int (0-10)
        - comment: str (optional)
        """
        logger.info(f'Processing NPS feedback for widget {widget_id}')

        feedback_data = {
            'score': data.get('score', 0),
            'comment': data.get('comment', ''),
        }

        return await feedback_service.create_feedback_from_widget(
            db=db,
            widget_id=widget_id,
            project_id=project_id,
            widget_type=WidgetType.NPS,
            data=feedback_data,
        )

    @staticmethod
    async def handle_csat_widget(
        db: AsyncSession, widget_id: UUID, project_id: UUID, data: Dict[str, Any]
    ):
        """
        Handle CSAT widget feedback (1-5 scale)

        Expected data:
        - score: int (1-5)
        - comment: str (optional)
        """
        logger.info(f'Processing CSAT feedback for widget {widget_id}')

        feedback_data = {
            'score': data.get('score', 1),
            'comment': data.get('comment', ''),
        }

        return await feedback_service.create_feedback_from_widget(
            db=db,
            widget_id=widget_id,
            project_id=project_id,
            widget_type=WidgetType.CSAT,
            data=feedback_data,
        )

    @staticmethod
    async def handle_ces_widget(
        db: AsyncSession, widget_id: UUID, project_id: UUID, data: Dict[str, Any]
    ):
        """
        Handle CES widget feedback (1-5 scale)

        Expected data:
        - score: int (1-5)
        - comment: str (optional)
        """
        logger.info(f'Processing CES feedback for widget {widget_id}')

        feedback_data = {
            'score': data.get('score', 1),
            'comment': data.get('comment', ''),
        }

        return await feedback_service.create_feedback_from_widget(
            db=db,
            widget_id=widget_id,
            project_id=project_id,
            widget_type=WidgetType.CES,
            data=feedback_data,
        )

    @staticmethod
    async def handle_widget_feedback(
        db: AsyncSession,
        widget_id: UUID,
        project_id: UUID,
        widget_type: WidgetType,
        data: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None,
    ):
        """
        Generic handler that routes to the appropriate widget handler based on type
        """
        logger.info(f'Handling {widget_type.value} feedback for widget {widget_id}')

        handlers = {
            WidgetType.REVIEW: WidgetFeedbackHandler.handle_review_widget,
            WidgetType.BUG_REPORT: WidgetFeedbackHandler.handle_bug_report_widget,
            WidgetType.FEATURE_REQUEST: WidgetFeedbackHandler.handle_feature_request_widget,
            WidgetType.NPS: WidgetFeedbackHandler.handle_nps_widget,
            WidgetType.CSAT: WidgetFeedbackHandler.handle_csat_widget,
            WidgetType.CES: WidgetFeedbackHandler.handle_ces_widget,
        }

        handler = handlers.get(widget_type)
        if handler:
            return await handler(db, widget_id, project_id, data)
        else:
            # Default to general feedback
            return await feedback_service.create_feedback_from_widget(
                db=db,
                widget_id=widget_id,
                project_id=project_id,
                widget_type=widget_type,
                data=data,
                context=context,
            )


# Example usage functions
class WidgetFeedbackExamples:
    """
    Examples of how to use the widget feedback system
    """

    @staticmethod
    def get_review_example_data() -> Dict[str, Any]:
        """Example data for a review widget"""
        return {
            'rating': 5,
            'title': 'Great Product!',
            'message': 'This product exceeded my expectations.',
            'pros': 'Easy to use, great features, excellent support',
            'cons': 'Could use more customization options',
        }

    @staticmethod
    def get_bug_report_example_data() -> Dict[str, Any]:
        """Example data for a bug report widget"""
        return {
            'title': 'Login button not working',
            'description': 'Users cannot log in using the login button',
            'severity': 'high',
            'steps_to_reproduce': '1. Go to login page\n2. Enter credentials\n3. Click login button',
            'expected_result': 'User should be logged in and redirected to dashboard',
            'actual_result': 'Button does nothing, no error message shown',
        }

    @staticmethod
    def get_feature_request_example_data() -> Dict[str, Any]:
        """Example data for a feature request widget"""
        return {
            'title': 'Dark mode support',
            'description': 'Add dark mode theme option for better user experience',
            'suggested_solution': 'Add a theme toggle in settings with light/dark options',
            'benefits': 'Reduces eye strain, improves accessibility, modern UI trend',
            'use_case': 'Users working in low-light environments',
        }

    @staticmethod
    def get_nps_example_data() -> Dict[str, Any]:
        """Example data for an NPS widget"""
        return {
            'score': 9,
            'comment': 'Very satisfied with the product and would recommend it to others.',
        }

    @staticmethod
    def get_csat_example_data() -> Dict[str, Any]:
        """Example data for a CSAT widget"""
        return {
            'score': 5,
            'comment': 'Extremely satisfied with the customer service experience.',
        }

    @staticmethod
    def get_ces_example_data() -> Dict[str, Any]:
        """Example data for a CES widget"""
        return {'score': 4, 'comment': 'It was quite easy to find the help I needed.'}


widget_feedback_handler = WidgetFeedbackHandler()
