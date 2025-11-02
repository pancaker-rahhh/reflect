from uuid import UUID, uuid4
from datetime import datetime, timezone
from app.models.widget_model import Widget, WidgetType, WidgetStatus


def create_widget(
    project_id: UUID,
    name: str = 'Test Widget',
    widget_type: WidgetType = WidgetType.FEEDBACK,
    public_key: str | None = None,
    status: WidgetStatus = WidgetStatus.ACTIVE,
) -> Widget:
    if public_key is None:
        public_key = f'test_widget_{uuid4().hex[:12]}'
    return Widget(
        id=uuid4(),
        name=name,
        project_id=project_id,
        widget_type=widget_type,
        public_key=public_key,
        status=status,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )


def create_review_widget(project_id: UUID, **kwargs) -> Widget:
    return create_widget(project_id=project_id, widget_type=WidgetType.REVIEW, **kwargs)


def create_nps_widget(project_id: UUID, **kwargs) -> Widget:
    return create_widget(project_id=project_id, widget_type=WidgetType.NPS, **kwargs)


def create_feature_request_widget(project_id: UUID, **kwargs) -> Widget:
    return create_widget(
        project_id=project_id, widget_type=WidgetType.FEATURE_REQUEST, **kwargs
    )


def create_bug_report_widget(project_id: UUID, **kwargs) -> Widget:
    return create_widget(
        project_id=project_id, widget_type=WidgetType.BUG_REPORT, **kwargs
    )
