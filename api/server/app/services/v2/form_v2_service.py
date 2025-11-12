import random
import string
from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.v2.forms_v2_model import FormV2, FormResponseV2
from app.repositories.v2.forms_v2_repository import (
    form_v2_repository,
    form_field_v2_repository,
    form_response_v2_repository,
)
from app.schemas.v2.form_v2_schema import (
    FormV2Create,
    FormV2Update,
    FormV2Response,
    FormFieldV2Response,
    FormResponseV2Create,
    TextFieldCreate,
    NumberFieldCreate,
    ChoiceFieldCreate,
    TextFieldUpdate,
    NumberFieldUpdate,
    ChoiceFieldUpdate,
)
from app.core.exceptions import NotFoundError, SubscriptionLimitExceededError
from app.core.logging import get_logger
from app.services.feedback_service import feedback_service
from app.models.feedback_model import FeedbackType, FeedbackPriority
from app.services.usage_tracking_service import usage_tracking_service
from app.core.subscription_plans import PLAN_LIMITS
from app.models.usage_tracking_model import ResourceType
from app.services.project_service import project_service

logger = get_logger(__name__)


class FormV2Service:
    def __init__(self):
        self.feedback_service = feedback_service

    def _generate_public_link(self) -> str:
        letters = string.ascii_letters
        return ''.join(random.choices(letters, k=16))

    def _field_to_config(self, field_data) -> list:
        config = []

        if isinstance(field_data, TextFieldCreate):
            if field_data.max_length is not None:
                config.append({'key': 'max_length', 'value': field_data.max_length})
            if field_data.default_value is not None:
                config.append(
                    {'key': 'default_value', 'value': field_data.default_value}
                )

        elif isinstance(field_data, NumberFieldCreate):
            if field_data.min_value is not None:
                config.append({'key': 'min_value', 'value': field_data.min_value})
            if field_data.max_value is not None:
                config.append({'key': 'max_value', 'value': field_data.max_value})
            if field_data.default_value is not None:
                config.append(
                    {'key': 'default_value', 'value': field_data.default_value}
                )

        elif isinstance(field_data, ChoiceFieldCreate):
            config.append({'key': 'choices', 'value': field_data.choices})
            config.append({'key': 'multiple', 'value': field_data.multiple})
            if field_data.default_value is not None:
                config.append(
                    {'key': 'default_value', 'value': field_data.default_value}
                )

        return config

    async def create_form(
        self, db: AsyncSession, form_data: FormV2Create
    ) -> FormV2Response:
        form_dict = {
            'project_id': form_data.project_id,
            'name': form_data.name,
            'description': form_data.description,
            'is_active': form_data.is_active,
            'form_type': 'custom',
            'public_link': self._generate_public_link(),
            'config': form_data.config or {},
        }
        form = await form_v2_repository.create(db, **form_dict)

        if form_data.fields:
            for field_data in form_data.fields:
                field_dict = {
                    'form_id': form.id,
                    'field_type': field_data.field_type,
                    'field_key': field_data.field_key,
                    'label': field_data.label,
                    'is_required': field_data.is_required,
                    'order_index': field_data.order_index,
                    'config': self._field_to_config(field_data),
                }
                await form_field_v2_repository.create(db, **field_dict)

        form_with_fields = await form_v2_repository.get_with_fields(db, form.id)
        logger.info(f'Created form v2 {form.id} for project {form_data.project_id}')

        return FormV2Response.model_validate(form_with_fields)

    async def get_form(
        self, db: AsyncSession, form_id: UUID
    ) -> Optional[FormV2Response]:
        form = await form_v2_repository.get_with_fields(db, form_id)
        if not form:
            return None
        return FormV2Response.model_validate(form)

    async def get_form_by_public_link(
        self, db: AsyncSession, public_link: str
    ) -> Optional[FormV2Response]:
        form = await form_v2_repository.get_by_public_link(db, public_link)
        if not form:
            return None
        return FormV2Response.model_validate(form)

    async def list_forms(
        self,
        db: AsyncSession,
        project_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[FormV2Response]:
        if project_id:
            forms = await form_v2_repository.get_by_project(db, project_id, skip, limit)
        else:
            forms = await form_v2_repository.get_multi_with_fields(db, skip, limit)

        return [FormV2Response.model_validate(form) for form in forms]

    async def update_form(
        self, db: AsyncSession, form_id: UUID, form_data: FormV2Update
    ) -> Optional[FormV2Response]:
        update_dict = form_data.model_dump(exclude_unset=True)
        form = await form_v2_repository.update(db, form_id, **update_dict)
        if not form:
            return None

        form_with_fields = await form_v2_repository.get_with_fields(db, form_id)
        logger.info(f'Updated form v2 {form_id}')

        return FormV2Response.model_validate(form_with_fields)

    async def delete_form(self, db: AsyncSession, form_id: UUID) -> bool:
        success = await form_v2_repository.delete(db, form_id)
        if success:
            logger.info(f'Deleted form v2 {form_id}')
        return success

    async def get_form_fields(
        self, db: AsyncSession, form_id: UUID
    ) -> List[FormFieldV2Response]:
        fields = await form_field_v2_repository.get_by_form(db, form_id)
        return [FormFieldV2Response.model_validate(field) for field in fields]

    async def add_field_to_form(
        self,
        db: AsyncSession,
        form_id: UUID,
        field_data: TextFieldCreate | NumberFieldCreate | ChoiceFieldCreate,
    ) -> FormFieldV2Response:
        form = await form_v2_repository.get(db, form_id)
        if not form:
            raise NotFoundError(f'Form {form_id} not found')

        existing_fields = await form_field_v2_repository.get_by_form(db, form_id)
        max_order = max([f.order_index for f in existing_fields], default=-1)

        field_dict = {
            'form_id': form_id,
            'field_type': field_data.field_type,
            'field_key': field_data.field_key,
            'label': field_data.label,
            'is_required': field_data.is_required,
            'order_index': max(field_data.order_index, max_order + 1),
            'config': self._field_to_config(field_data),
        }
        field = await form_field_v2_repository.create(db, **field_dict)
        logger.info(f'Added field {field.id} to form v2 {form_id}')

        return FormFieldV2Response.model_validate(field)

    async def update_field(
        self,
        db: AsyncSession,
        field_id: UUID,
        field_data: TextFieldUpdate | NumberFieldUpdate | ChoiceFieldUpdate,
    ) -> Optional[FormFieldV2Response]:
        field = await form_field_v2_repository.get(db, field_id)
        if not field:
            return None

        update_dict = {}

        if field_data.field_key is not None:
            update_dict['field_key'] = field_data.field_key
        if field_data.label is not None:
            update_dict['label'] = field_data.label
        if field_data.is_required is not None:
            update_dict['is_required'] = field_data.is_required
        if field_data.order_index is not None:
            update_dict['order_index'] = field_data.order_index

        if field_data.field_type != field.field_type:
            update_dict['field_type'] = field_data.field_type

        new_config = self._field_to_config(field_data)
        if new_config:
            update_dict['config'] = new_config

        if not update_dict:
            return FormFieldV2Response.model_validate(field)

        updated_field = await form_field_v2_repository.update(
            db, field_id, **update_dict
        )
        logger.info(f'Updated field v2 {field_id}')

        return FormFieldV2Response.model_validate(updated_field)

    async def delete_field(self, db: AsyncSession, field_id: UUID) -> bool:
        success = await form_field_v2_repository.delete(db, field_id)
        if success:
            logger.info(f'Deleted field v2 {field_id}')
        return success

    async def submit_form_response(
        self,
        db: AsyncSession,
        public_link: str,
        response_data: FormResponseV2Create,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> None:
        form = await form_v2_repository.get_by_public_link(db, public_link)
        if not form:
            raise NotFoundError('Form not found')

        if not form.is_active:
            raise ValueError('This form is no longer accepting responses')

        project = await project_service.get_project_by_id(db, form.project_id)
        if not project:
            raise NotFoundError('Project not found')

        organization = await usage_tracking_service.get_organization_subscription(
            db, project.organization_id
        )
        if not organization:
            limits = PLAN_LIMITS['free']
        else:
            plan = organization.subscription_plan or 'free'
            limits = PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])

        limit = limits.get(ResourceType.FORM_RESPONSES.value, 0)
        can_create = (
            limit >= 999
            or await usage_tracking_service.get_current_usage(
                db, project.organization_id, ResourceType.FORM_RESPONSES.value
            )
            < limit
        )

        if not can_create:
            current_usage = await usage_tracking_service.get_current_usage(
                db, project.organization_id, ResourceType.FORM_RESPONSES.value
            )
            raise SubscriptionLimitExceededError(
                resource_type=ResourceType.FORM_RESPONSES.value,
                current_usage=current_usage,
                limit=limits.get(ResourceType.FORM_RESPONSES.value, 0),
                message='Upgrade to Pro plan for unlimited form responses',
            )

        await self._validate_required_fields(form, response_data.answers)

        response_dict = {
            'form_id': form.id,
            'answers': response_data.answers,
            'submitter_email': response_data.submitter_email,
            'submitter_name': response_data.submitter_name,
            'ip_address': ip_address,
            'user_agent': user_agent,
        }

        response = await form_response_v2_repository.create(db, **response_dict)
        logger.info(f'Created form response {response.id} for form {form.id}')

        await usage_tracking_service.increment_usage(
            db, project.organization_id, ResourceType.FORM_RESPONSES.value
        )

        feedback_ids = await self._create_feedback_from_response(
            db, form, response, response_data.answers
        )

        if feedback_ids:
            await form_response_v2_repository.update(
                db, response.id, feedback_ids=feedback_ids
            )
            logger.info(
                f'Created {len(feedback_ids)} feedback records for form response {response.id}'
            )

    async def _validate_required_fields(self, form: FormV2, answers: dict) -> None:
        if not form.fields:
            pass

        missing_fields = []
        for field in form.fields:
            if field.is_required:
                answer = answers.get(field.field_key)
                if (
                    answer is None
                    or answer == ''
                    or (isinstance(answer, list) and len(answer) == 0)
                ):
                    missing_fields.append(field.label)

        if missing_fields:
            raise ValueError(f"Required fields missing: {', '.join(missing_fields)}")

    async def get_form_responses(
        self, db: AsyncSession, form_id: UUID, skip: int = 0, limit: int = 100
    ) -> dict:
        responses = await form_response_v2_repository.get_by_form(
            db, form_id, skip, limit
        )
        total = await form_response_v2_repository.count_by_form(db, form_id)

        return {'total': total, 'items': responses}

    async def get_form_metrics(
        self, db: AsyncSession, form_id: UUID, time_range: str = 'all'
    ) -> dict:
        return await form_response_v2_repository.get_form_metrics(
            db, form_id, time_range
        )

    def _detect_survey_types(
        self, form: FormV2, answers: Dict[str, Any]
    ) -> Dict[str, Any]:
        survey_data = {}
        text_fields_with_survey_type = set()

        for field in form.fields:
            field_key = field.field_key.lower()
            label = field.label.lower()
            answer = answers.get(field.field_key)

            if field.field_type == 'number' and answer is not None:
                try:
                    score = int(answer)
                except (ValueError, TypeError):
                    continue

                if 'nps_rating' in field_key or 'recommend' in label or 'nps' in label:
                    survey_data['nps'] = {'field': field, 'score': score}
                elif (
                    'review_rating' in field_key
                    or ('rate' in label and 'experience' in label)
                    or (
                        'review' in label
                        and 'satisfied' not in label
                        and 'easy' not in label
                    )
                ):
                    survey_data['review'] = {'field': field, 'score': score}
                elif (
                    'satisfied' in label
                    or (
                        'rate' in label
                        and 'review_rating' not in field_key
                        and 'experience' not in label
                    )
                    or 'score' in label
                ):
                    survey_data['csat'] = {'field': field, 'score': score}
                elif 'easy' in label:
                    survey_data['ces'] = {'field': field, 'score': score}

            if field.field_type == 'text' and answer:
                if (
                    'bug' in field_key
                    or 'error' in field_key
                    or 'bug' in label
                    or 'error' in label
                ):
                    survey_data['bug_report'] = {'field': field, 'message': str(answer)}
                    text_fields_with_survey_type.add(field.field_key)
                elif (
                    'feature' in field_key
                    or 'request' in field_key
                    or 'feature' in label
                    or 'request' in label
                ):
                    survey_data['feature_request'] = {
                        'field': field,
                        'message': str(answer),
                    }
                    text_fields_with_survey_type.add(field.field_key)
                else:
                    field_config = field.config if field.config else []
                    survey_type_config = None
                    if isinstance(field_config, list):
                        for config_item in field_config:
                            if (
                                isinstance(config_item, dict)
                                and config_item.get('key') == 'survey_type'
                            ):
                                survey_type_config = config_item.get('value')
                                text_fields_with_survey_type.add(field.field_key)
                                break

                    if (
                        not survey_type_config
                        and field.field_key not in text_fields_with_survey_type
                    ):
                        if 'general_feedback' not in survey_data:
                            survey_data['general_feedback'] = []
                        survey_data['general_feedback'].append(
                            {'field': field, 'message': str(answer)}
                        )

        return survey_data

    async def _create_feedback_from_response(
        self,
        db: AsyncSession,
        form: FormV2,
        response: FormResponseV2,
        answers: Dict[str, Any],
    ) -> List[str]:
        survey_data = self._detect_survey_types(form, answers)
        feedback_ids = []

        logger.info(f'Survey data detected: {list(survey_data.keys())}')
        if 'general_feedback' in survey_data:
            logger.info(
                f'General feedback items: {len(survey_data["general_feedback"])}'
            )

        base_metadata = {
            'form_response_v2_id': str(response.id),
            'form_name': form.name,
            'submission_method': 'form',
        }

        base_context = {
            'ip_address': response.ip_address,
            'user_agent': response.user_agent,
        }

        for survey_type, data in survey_data.items():
            try:
                if survey_type == 'nps':
                    comment = self._extract_comment_from_answers(
                        form, answers, 'nps', data.get('field')
                    )
                    feedback_data = {
                        'widget_id': None,
                        'project_id': form.project_id,
                        'feedback_type': FeedbackType.NPS,
                        'nps_score': data['score'],
                        'message': comment if comment else '',
                        'feedback_metadata': {
                            **base_metadata,
                            'nps_score': data['score'],
                        },
                        'context': base_context,
                        'submitter_name': response.submitter_name,
                        'submitter_email': response.submitter_email,
                        'is_anonymous': not bool(
                            response.submitter_name or response.submitter_email
                        ),
                    }
                    if data['score'] >= 9:
                        feedback_data['promoter_category'] = 'promoter'
                    elif data['score'] >= 7:
                        feedback_data['promoter_category'] = 'passive'
                    else:
                        feedback_data['promoter_category'] = 'detractor'

                elif survey_type == 'review':
                    comment = self._extract_comment_from_answers(
                        form, answers, 'review', data.get('field')
                    )
                    feedback_data = {
                        'widget_id': None,
                        'project_id': form.project_id,
                        'feedback_type': FeedbackType.REVIEW,
                        'overall_rating': data['score'],
                        'message': comment if comment else '',
                        'feedback_metadata': {
                            **base_metadata,
                            'overall_rating': data['score'],
                        },
                        'context': base_context,
                        'submitter_name': response.submitter_name,
                        'submitter_email': response.submitter_email,
                        'is_anonymous': not bool(
                            response.submitter_name or response.submitter_email
                        ),
                    }

                elif survey_type == 'csat':
                    comment = self._extract_comment_from_answers(
                        form, answers, 'csat', data.get('field')
                    )
                    feedback_data = {
                        'widget_id': None,
                        'project_id': form.project_id,
                        'feedback_type': FeedbackType.CSAT,
                        'csat_score': data['score'],
                        'message': comment if comment else '',
                        'feedback_metadata': {
                            **base_metadata,
                            'csat_score': data['score'],
                        },
                        'context': base_context,
                        'submitter_name': response.submitter_name,
                        'submitter_email': response.submitter_email,
                        'is_anonymous': not bool(
                            response.submitter_name or response.submitter_email
                        ),
                    }
                    satisfaction_levels = {
                        1: 'very_dissatisfied',
                        2: 'dissatisfied',
                        3: 'neutral',
                        4: 'satisfied',
                        5: 'very_satisfied',
                    }
                    feedback_data['satisfaction_level'] = satisfaction_levels.get(
                        data['score'], 'neutral'
                    )

                elif survey_type == 'ces':
                    comment = self._extract_comment_from_answers(
                        form, answers, 'ces', data.get('field')
                    )
                    feedback_data = {
                        'widget_id': None,
                        'project_id': form.project_id,
                        'feedback_type': FeedbackType.CES,
                        'ces_score': data['score'],
                        'message': comment if comment else '',
                        'feedback_metadata': {
                            **base_metadata,
                            'ces_score': data['score'],
                        },
                        'context': base_context,
                        'submitter_name': response.submitter_name,
                        'submitter_email': response.submitter_email,
                        'is_anonymous': not bool(
                            response.submitter_name or response.submitter_email
                        ),
                    }
                    ease_levels = {
                        1: 'very_difficult',
                        2: 'difficult',
                        3: 'neutral',
                        4: 'easy',
                        5: 'very_easy',
                    }
                    feedback_data['ease_level'] = ease_levels.get(
                        data['score'], 'neutral'
                    )

                elif survey_type == 'bug_report':
                    severity = self._extract_severity_from_answers(form, answers)
                    feedback_data = {
                        'widget_id': None,
                        'project_id': form.project_id,
                        'feedback_type': FeedbackType.BUG_REPORT,
                        'message': data.get('message', ''),
                        'severity_level': severity,
                        'feedback_metadata': {
                            **base_metadata,
                            'severity': severity.value
                            if isinstance(severity, FeedbackPriority)
                            else 'medium',
                        },
                        'context': base_context,
                        'submitter_name': response.submitter_name,
                        'submitter_email': response.submitter_email,
                        'is_anonymous': not bool(
                            response.submitter_name or response.submitter_email
                        ),
                    }

                elif survey_type == 'feature_request':
                    priority = self._extract_priority_from_answers(form, answers)
                    feedback_data = {
                        'widget_id': None,
                        'project_id': form.project_id,
                        'feedback_type': FeedbackType.FEATURE_REQUEST,
                        'message': data.get('message', ''),
                        'feedback_metadata': {
                            **base_metadata,
                            'priority': priority.value
                            if isinstance(priority, FeedbackPriority)
                            else 'medium',
                        },
                        'context': base_context,
                        'submitter_name': response.submitter_name,
                        'submitter_email': response.submitter_email,
                        'is_anonymous': not bool(
                            response.submitter_name or response.submitter_email
                        ),
                    }

                elif survey_type == 'general_feedback':
                    for feedback_item in data:
                        field_obj = feedback_item.get('field')
                        field_label = (
                            field_obj.label if hasattr(field_obj, 'label') else None
                        )

                        feedback_data = {
                            'widget_id': None,
                            'project_id': form.project_id,
                            'feedback_type': FeedbackType.GENERAL,
                            'message': feedback_item.get('message', ''),
                            'feedback_metadata': {
                                **base_metadata,
                                'field_label': field_label,
                            },
                            'context': base_context,
                            'submitter_name': response.submitter_name,
                            'submitter_email': response.submitter_email,
                            'is_anonymous': not bool(
                                response.submitter_name or response.submitter_email
                            ),
                        }

                        from app.schemas.feedback_schema import GeneralFeedbackCreate

                        payload = GeneralFeedbackCreate(**feedback_data)
                        created_feedback = await self.feedback_service.create_feedback(
                            db, payload
                        )
                        feedback_ids.append(str(created_feedback.id))
                    continue

                else:
                    continue

                if survey_type == 'nps':
                    from app.schemas.feedback_schema import NPSFeedbackCreate

                    payload = NPSFeedbackCreate(**feedback_data)
                elif survey_type == 'review':
                    from app.schemas.feedback_schema import ReviewFeedbackCreate

                    payload = ReviewFeedbackCreate(**feedback_data)
                elif survey_type == 'csat':
                    from app.schemas.feedback_schema import CSATFeedbackCreate

                    payload = CSATFeedbackCreate(**feedback_data)
                elif survey_type == 'ces':
                    from app.schemas.feedback_schema import CESFeedbackCreate

                    payload = CESFeedbackCreate(**feedback_data)
                elif survey_type == 'bug_report':
                    from app.schemas.feedback_schema import BugReportFeedbackCreate

                    payload = BugReportFeedbackCreate(**feedback_data)
                elif survey_type == 'feature_request':
                    from app.schemas.feedback_schema import FeatureRequestFeedbackCreate

                    payload = FeatureRequestFeedbackCreate(**feedback_data)

                feedback_result = await feedback_service.create_feedback(db, payload)
                feedback_ids.append(str(feedback_result.id))

            except Exception as e:
                logger.error(
                    f'Failed to create {survey_type} feedback from form response {response.id}: {str(e)}'
                )
                continue

        return feedback_ids

    def _extract_comment_from_answers(
        self,
        form: FormV2,
        answers: Dict[str, Any],
        survey_type: str,
        rating_field: Any = None,
    ) -> Optional[str]:
        rating_field_index = None
        if rating_field:
            for idx, field in enumerate(form.fields):
                if field.id == rating_field.id:
                    rating_field_index = idx
                    break

        for field in form.fields:
            if field.field_type != 'text':
                continue

            answer = answers.get(field.field_key)
            if not answer or not str(answer).strip():
                continue

            field_config = field.config if field.config else []
            survey_type_config = None
            if isinstance(field_config, list):
                for config_item in field_config:
                    if (
                        isinstance(config_item, dict)
                        and config_item.get('key') == 'survey_type'
                    ):
                        survey_type_config = str(config_item.get('value', '')).lower()
                        break

            if survey_type_config and survey_type_config == survey_type.lower():
                return str(answer).strip()

        if rating_field_index is not None:
            for field in form.fields:
                if field.field_type != 'text':
                    continue

                answer = answers.get(field.field_key)
                if not answer or not str(answer).strip():
                    continue

                field_index = None
                for idx, f in enumerate(form.fields):
                    if f.id == field.id:
                        field_index = idx
                        break

                if field_index == rating_field_index + 1:
                    field_key = field.field_key.lower()
                    if survey_type == 'nps' and (
                        'nps_comment' in field_key
                        or ('comment' in field_key and 'nps' in field_key)
                    ):
                        return str(answer).strip()
                    elif survey_type == 'csat' and (
                        'csat_comment' in field_key
                        or ('comment' in field_key and 'csat' in field_key)
                    ):
                        return str(answer).strip()
                    elif survey_type == 'ces' and (
                        'ces_comment' in field_key
                        or ('comment' in field_key and 'ces' in field_key)
                    ):
                        return str(answer).strip()
                    elif survey_type == 'review' and (
                        'review_comment' in field_key
                        or ('comment' in field_key and 'review' in field_key)
                    ):
                        return str(answer).strip()

        return None

    def _extract_severity_from_answers(
        self, form: FormV2, answers: Dict[str, Any]
    ) -> FeedbackPriority:
        for field in form.fields:
            if field.field_type == 'choice':
                field_key = field.field_key.lower()
                label = field.label.lower()
                answer = answers.get(field.field_key)

                if not answer:
                    continue

                if 'severity' in field_key or 'severity' in label:
                    answer_str = str(answer).lower()
                    try:
                        return FeedbackPriority(answer_str)
                    except ValueError:
                        pass

        return FeedbackPriority.MEDIUM

    def _extract_priority_from_answers(
        self, form: FormV2, answers: Dict[str, Any]
    ) -> FeedbackPriority:
        for field in form.fields:
            if field.field_type == 'choice':
                field_key = field.field_key.lower()
                label = field.label.lower()
                answer = answers.get(field.field_key)

                if not answer:
                    continue

                if 'priority' in field_key or 'priority' in label:
                    answer_str = str(answer).lower()
                    try:
                        return FeedbackPriority(answer_str)
                    except ValueError:
                        pass

        return FeedbackPriority.MEDIUM


form_v2_service = FormV2Service()
