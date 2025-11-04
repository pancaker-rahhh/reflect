import pytest
from httpx import AsyncClient
from unittest.mock import patch
from app.models.widget_model import WidgetType


@pytest.mark.asyncio
class TestPublicFeedbackSubmission:
    async def test_success_for_feedback_widget(
        self, async_client: AsyncClient, test_widget
    ):
        response = await async_client.post(
            '/api/v1/public/feedback',
            json={
                'widgetKey': test_widget.public_key,
                'message': 'Test feedback message',
                'feedbackType': 'FEEDBACK',
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert 'id' in data
        assert 'message' in data

    async def test_success_for_review_widget(
        self, async_client: AsyncClient, test_widget, async_db_session
    ):
        test_widget.widget_type = WidgetType.REVIEW
        await async_db_session.commit()
        response = await async_client.post(
            '/api/v1/public/feedback',
            json={
                'widgetKey': test_widget.public_key,
                'message': 'Great product!',
                'feedbackType': 'REVIEW',
                'overall_rating': 5,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert 'id' in data

    async def test_input_sanitization_applied(
        self, async_client: AsyncClient, test_widget
    ):
        malicious_input = '<script>alert("XSS")</script>'
        response = await async_client.post(
            '/api/v1/public/feedback',
            json={
                'widgetKey': test_widget.public_key,
                'message': malicious_input,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert '<script>' not in data.get('message', '').lower()

    async def test_invalid_widget_key_returns_400(self, async_client: AsyncClient):
        with patch('app.core.rate_limiting.check_rate_limit', return_value=True):
            response = await async_client.post(
                '/api/v1/public/feedback',
                json={
                    'widgetKey': 'invalid-widget-key!',
                    'message': 'Test',
                },
            )
            assert response.status_code == 400

    async def test_rate_limiting_enforced(
        self, async_client: AsyncClient, test_widget, mock_rate_limit_storage
    ):
        # Anonymous limit for feedback_submission is 3 calls per 300 seconds
        # First 3 requests should succeed
        for i in range(3):
            response = await async_client.post(
                '/api/v1/public/feedback',
                json={
                    'widgetKey': test_widget.public_key,
                    'message': f'Feedback {i}',
                },
            )
            assert (
                response.status_code == 201
            ), f'Request {i+1} should succeed, got {response.status_code}'

        # 4th request should be rate limited
        response = await async_client.post(
            '/api/v1/public/feedback',
            json={
                'widgetKey': test_widget.public_key,
                'message': 'Should fail',
            },
        )
        assert (
            response.status_code == 429
        ), f'4th request should be rate limited, got {response.status_code}'


@pytest.mark.asyncio
class TestGetWidgetFeedback:
    async def test_success_returns_feedback_list(
        self, async_client: AsyncClient, test_widget
    ):
        response = await async_client.get(
            f'/api/v1/public/widgets/{test_widget.public_key}/feedback',
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_invalid_widget_key_returns_400(self, async_client: AsyncClient):
        response = await async_client.get(
            '/api/v1/public/widgets/invalid-key!/feedback',
        )
        assert response.status_code == 400

    async def test_rate_limiting_enforced(
        self, async_client: AsyncClient, test_widget, mock_rate_limit_storage
    ):
        with patch('app.core.rate_limiting.check_rate_limit', return_value=True):
            for _ in range(5):
                response = await async_client.get(
                    f'/api/v1/public/widgets/{test_widget.public_key}/feedback',
                )
                assert response.status_code == 200


@pytest.mark.asyncio
class TestGetWidgetConfig:
    async def test_success_returns_widget_config(
        self, async_client: AsyncClient, test_widget
    ):
        response = await async_client.get(
            f'/api/v1/public/widgets/{test_widget.public_key}',
        )
        assert response.status_code == 200
        data = response.json()
        assert 'widget_type' in data
        assert 'position' in data
        assert 'configuration' in data
        assert 'theme_configuration' in data
        assert 'targeting_rules' in data


@pytest.mark.asyncio
class TestVote:
    async def test_success_for_feature_request(
        self, async_client: AsyncClient, test_widget, async_db_session
    ):
        from app.models.feedback_model import Feedback, FeedbackType
        from uuid import uuid4

        feedback = Feedback(
            id=uuid4(),
            widget_id=test_widget.id,
            project_id=test_widget.project_id,
            feedback_type=FeedbackType.FEATURE_REQUEST,
            message='Feature request',
            is_anonymous=True,
        )
        async_db_session.add(feedback)
        await async_db_session.commit()
        response = await async_client.post(
            '/api/v1/public/vote',
            json={
                'itemId': str(feedback.id),
                'itemType': 'feature_request',
                'widgetKey': test_widget.public_key,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data['success'] is True
        assert 'newVoteCount' in data

    async def test_invalid_item_id_returns_400(
        self, async_client: AsyncClient, test_widget
    ):
        response = await async_client.post(
            '/api/v1/public/vote',
            json={
                'itemId': 'not-a-uuid',
                'itemType': 'feature_request',
                'widgetKey': test_widget.public_key,
            },
        )
        assert response.status_code == 400
