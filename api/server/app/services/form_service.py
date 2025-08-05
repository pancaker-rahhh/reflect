from typing import List, Optional, Tuple
from uuid import UUID
import sqlalchemy.exc
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload, selectinload
from app.models.schemas.user_schemas import UserInfo
from app.core.constants import FieldStatusEnum, FormModeEnum, FormStatusEnum
from app.models.schemas.form_schemas import (
    AppendFieldRequest,
    AppendFieldResponse,
    FieldEditRequest,
    FormFieldAnswerResponse,
    FullRespondedFormResponse,
    SubmitFormResponse,
    FormCreateWithLLMRequest,
    FormEditRequest,
    FormCreateRequest,
    SubmitFormRequest,
)
from app.core.exceptions import (
    AuthorizationError,
    DatabaseError,
    LLMGenerationError,
    NotFoundError,
)
from app.models.models import (
    Field,
    Form,
    FormField,
    PartyMember,
    Template,
    Party,
    Submission,
    Notification,
)

from app.services.llm_service import get_llm_service
from datetime import datetime, timedelta


class FormService:
    def __init__(self, db: Session):
        self.db = db
        self.llm_service = get_llm_service()

    def create_form_with_llm(
        self, form_request: FormCreateWithLLMRequest, user_id: UUID
    ) -> Form:
        try:
            template = self._get_template(form_request.template_id, user_id)

            form_data = form_request.model_dump(
                exclude={
                    'parties',
                    'respondents',
                    'expires_at',
                }
            )
            expires_at = form_request.expires_at or (
                datetime.utcnow() + timedelta(days=2)
            )
            form = Form(
                **form_data,
                created_by_id=user_id,
                status=FormStatusEnum.DRAFT,
                expires_at=expires_at,
            )

            if form_request.respondents:
                form.respondents = form_request.respondents
            if form_request.parties:
                form.parties = (
                    self.db.query(Party)
                    .filter(Party.id.in_(form_request.parties))
                    .all()
                )

            self.db.add(form)
            self.db.flush()

            template_context = self._build_template_context(template)
            generated_fields = self.llm_service.generate_fields(
                template_context=template_context,
                form_context=form_request.context or '',
                feedback_giver_persona=form_request.feedback_giver_persona,
                feedback_receiver_persona=form_request.feedback_receiver_persona,
            )
            if not generated_fields:
                raise LLMGenerationError('Failed to generate fields for form from LLM')

            notes_field = {
                'question': 'Any further notes you want to add?',
                'type': 'text_long',
                'is_required': False,
                'placeholder': 'Add your notes here...',
                'options': [],
            }
            generated_fields.append(notes_field)

            self._create_fields_and_associations(form.id, generated_fields)
            self.db.flush()
            self._send_form_notifications(form, user_id)

            self.db.commit()
            self.db.refresh(form)
            return form

        except (sqlalchemy.exc.SQLAlchemyError, NotFoundError, LLMGenerationError) as e:
            self.db.rollback()
            if isinstance(e, sqlalchemy.exc.SQLAlchemyError):
                raise DatabaseError('Failed to create form in database') from e
            raise e
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(
                f'An unexpected error occurred during form creation: {e}'
            )

    def create_form(self, form_request: FormCreateRequest, user_id: UUID) -> Form:
        try:
            form_data = form_request.model_dump(
                exclude={'parties', 'respondents', 'expires_at', 'fields'}
            )
            expires_at = form_request.expires_at or (
                datetime.utcnow() + timedelta(days=2)
            )
            form = Form(
                **form_data,
                created_by_id=user_id,
                status=FormStatusEnum.DRAFT,
                expires_at=expires_at,
            )

            if form_request.respondents:
                form.respondents = form_request.respondents
            if form_request.parties:
                form.parties = (
                    self.db.query(Party)
                    .filter(Party.id.in_(form_request.parties))
                    .all()
                )

            self.db.add(form)
            self.db.flush()

            if form_request.fields:
                field_data_list = [field.model_dump() for field in form_request.fields]
                self._create_fields_and_associations(form.id, field_data_list)

            self.db.flush()
            self._send_form_notifications(form, user_id)

            self.db.commit()
            self.db.refresh(form)
            return form

        except (sqlalchemy.exc.SQLAlchemyError, NotFoundError) as e:
            self.db.rollback()
            if isinstance(e, sqlalchemy.exc.SQLAlchemyError):
                raise DatabaseError('Failed to create form in database') from e
            raise e
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(
                f'An unexpected error occurred during form creation: {e}'
            )

    def submit_form(
        self, form_submission_data: SubmitFormRequest, respondent_id: UUID
    ) -> Submission:
        try:
            form = (
                self.db.query(Form)
                .options(selectinload(Form.parties))
                .filter(Form.id == form_submission_data.form_id)
                .one()
            )

            if form.expires_at and form.expires_at < datetime.utcnow():
                raise PermissionError(
                    'This form has expired and is no longer accepting submissions.'
                )

            if form.mode == FormModeEnum.GIVE_FEEDBACK:
                if form.created_by_id != respondent_id:
                    raise PermissionError(
                        "Only the form creator can submit in 'give_feedback' mode."
                    )

            elif form.mode == FormModeEnum.COLLECT_FEEDBACK:
                is_in_respondents = respondent_id in (form.respondents or [])

                is_in_parties = False
                if form.parties:
                    is_in_parties = self.db.query(
                        self.db.query(Form)
                        .join(Form.parties)
                        .join(Party.members)
                        .filter(
                            Form.id == form.id,
                            PartyMember.user_id == respondent_id,
                        )
                        .exists()
                    ).scalar()

                if not is_in_respondents and not is_in_parties:
                    raise PermissionError(
                        'You are not authorized to submit a response to this form.'
                    )

                if form_submission_data.receiver_id != form.created_by_id:
                    raise ValueError(
                        "Invalid receiver_id for 'collect_feedback' mode. The receiver must be the form creator."
                    )

            answers_dict_list = [
                answer.model_dump(mode='json')
                for answer in form_submission_data.answers
            ]

            form_submission = Submission(
                form_id=form_submission_data.form_id,
                respondent_id=respondent_id,
                values=answers_dict_list,
                receiver_id=form_submission_data.receiver_id,
                submitted_at=datetime.utcnow(),
            )

            self.db.add(form_submission)
            form.status = FormStatusEnum.RESPONDED
            self.db.commit()
            self.db.refresh(form_submission)

            self._send_submission_notification(form, form_submission, respondent_id)

            return SubmitFormResponse(
                submission_id=form_submission.id,
                status='Success',
                message='Your response has been submitted successfully.',
            )

        except sqlalchemy.exc.NoResultFound:
            raise NotFoundError('Form not found')
        except (ValueError, PermissionError) as e:
            self.db.rollback()
            raise e
        except Exception as e:
            self.db.rollback()
            print(f'An unexpected error occurred: {e}')
            raise

    def get_all_user_form_summaries(self, user_id: UUID) -> List[Tuple]:
        try:
            return (
                self.db.query(
                    Form.id,
                    Form.title,
                    Form.created_at,
                    Form.status,
                )
                .filter(Form.created_by_id == user_id)
                .order_by(Form.created_at.desc())
                .all()
            )
        except sqlalchemy.exc.SQLAlchemyError as e:
            raise DatabaseError('Failed to fetch user form summaries') from e

    def get_forms_to_respond_to_summary(
        self, user_id: UUID, responded: Optional[bool]
    ) -> List[Tuple[object, Optional[UUID], Optional[UUID]]]:
        """
        Fetches form summaries for a user.
        - Includes forms the user needs to respond to (as giver).
        - Includes forms the user has received responses for (as receiver).
        - Returns a list of tuples: (form, receiver_id, respondent_id)
        """
        if responded is None:
            return []

        try:
            final_results = []
            status = (
                FormStatusEnum.RESPONDED
                if responded is True
                else FormStatusEnum.PUBLISHED
            )

            # --- Collect Feedback Mode (User is Giver) ---
            submission_exists_check = (
                self.db.query(Submission.id)
                .filter(
                    Submission.form_id == Form.id,
                    Submission.respondent_id == user_id,
                )
                .exists()
            )
            collect_feedback_query = self.db.query(Form).filter(
                Form.mode == FormModeEnum.COLLECT_FEEDBACK,
                Form.status == status,
                or_(
                    Form.respondents.op('@>')([user_id]),
                    Form.parties.any(Party.members.any(user_id=user_id)),
                ),
                Form.created_by_id != user_id,
            )
            if responded:
                collect_feedback_query = collect_feedback_query.filter(
                    submission_exists_check
                )
            else:
                collect_feedback_query = collect_feedback_query.filter(
                    ~submission_exists_check
                )

            for form in collect_feedback_query.all():
                final_results.append((form, form.created_by_id, user_id))

            # --- Give Feedback Mode (User is Giver) ---
            give_feedback_forms = (
                self.db.query(Form)
                .options(selectinload(Form.parties).selectinload(Party.members))
                .filter(
                    Form.mode == FormModeEnum.GIVE_FEEDBACK,
                    Form.created_by_id == user_id,
                    Form.status == status,
                )
                .all()
            )
            for form in give_feedback_forms:
                all_receiver_ids = set(form.respondents or [])
                if form.parties:
                    for party in form.parties:
                        all_receiver_ids.update(
                            member.user_id for member in party.members
                        )
                all_receiver_ids.discard(user_id)
                if not all_receiver_ids:
                    continue
                submitted_receiver_ids = {
                    res[0]
                    for res in self.db.query(Submission.receiver_id)
                    .filter(
                        Submission.form_id == form.id,
                        Submission.respondent_id == user_id,
                        Submission.receiver_id.in_(all_receiver_ids),
                    )
                    .all()
                }
                for receiver_id in all_receiver_ids:
                    has_submitted = receiver_id in submitted_receiver_ids
                    if (responded and has_submitted) or (
                        not responded and not has_submitted
                    ):
                        final_results.append((form, receiver_id, user_id))

            # --- Logged in user is Receiver ---
            if responded:
                received_submissions = (
                    self.db.query(Submission)
                    .options(selectinload(Submission.form))
                    .filter(Submission.receiver_id == user_id)
                    .all()
                )
                for submission in received_submissions:
                    if submission.form:
                        final_results.append(
                            (submission.form, user_id, submission.respondent_id)
                        )

            unique_results = {
                (form.id, receiver_id, respondent_id): (
                    form,
                    receiver_id,
                    respondent_id,
                )
                for form, receiver_id, respondent_id in final_results
            }

            sorted_results = sorted(
                unique_results.values(), key=lambda x: x[0].created_at, reverse=True
            )
            return sorted_results

        except sqlalchemy.exc.SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError('Failed to fetch assigned form summaries') from e

    def get_forms_by_template(self, template_id: UUID, user_id: UUID) -> List[Form]:
        try:
            self._get_template(template_id, user_id)
            return (
                self.db.query(Form)
                .filter(Form.template_id == template_id, Form.created_by_id == user_id)
                .options(
                    joinedload(Form.form_fields).joinedload(FormField.field),
                    joinedload(Form.parties),
                )
                .all()
            )
        except sqlalchemy.exc.SQLAlchemyError as e:
            raise DatabaseError('Failed to fetch forms by template') from e

    def get_form_by_id(self, form_id: UUID, user_id: UUID) -> Form:
        try:
            form = (
                self.db.query(Form)
                .filter(Form.id == form_id)  # Allow any authorized user to get form
                .options(
                    joinedload(Form.form_fields).joinedload(FormField.field),
                    selectinload(Form.parties).selectinload(Party.members),
                )
                .one_or_none()
            )
            if not form:
                raise NotFoundError('Form not found')

            is_creator = form.created_by_id == user_id
            # TODO - This check is complex, skipping for now but should be implemented
            # is_respondent = ...

            if not is_creator:
                # TODO - Add more authorization logic here if needed
                pass

            return form
        except sqlalchemy.exc.SQLAlchemyError as e:
            raise DatabaseError(f'Database query failed for form {form_id}') from e

    def update_form(
        self, form_id: UUID, form_request: FormEditRequest, user_id: UUID
    ) -> Form:
        try:
            form_to_update = (
                self.db.query(Form)
                .filter(Form.id == form_id, Form.created_by_id == user_id)
                .one()
            )

            existing_respondents = set(form_to_update.respondents or [])
            existing_party_users = set()
            for party in form_to_update.parties:
                for member in party.members:
                    existing_party_users.add(member.user_id)
            all_existing_users = existing_respondents.union(existing_party_users)

            was_draft = form_to_update.status == FormStatusEnum.DRAFT

            update_data = form_request.model_dump(
                exclude_unset=True,
                exclude={'fields', 'parties', 'respondents'},
            )

            for key, value in update_data.items():
                setattr(form_to_update, key, value)

            if form_request.fields is not None:
                self._update_form_fields(form_id, form_request.fields)

            if form_request.parties is not None:
                form_to_update.parties = (
                    self.db.query(Party)
                    .filter(Party.id.in_(form_request.parties))
                    .all()
                )
            if form_request.respondents is not None:
                form_to_update.respondents = form_request.respondents

            if hasattr(form_request, 'status') and form_request.status:
                form_to_update.status = form_request.status

            self.db.commit()
            self.db.refresh(form_to_update)

            if was_draft and form_to_update.status == FormStatusEnum.PUBLISHED:
                self._send_form_notifications(form_to_update, user_id)
            elif not was_draft:
                self._send_form_update_notifications(
                    form_to_update, user_id, all_existing_users
                )

            return form_to_update
        except sqlalchemy.exc.NoResultFound:
            raise NotFoundError(
                'Form not found or you are not authorized to update it.'
            )
        except sqlalchemy.exc.SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError('Failed to update form in database') from e

    def delete_form(self, form_id: UUID, user_id: UUID) -> None:
        try:
            form_to_delete = (
                self.db.query(Form)
                .filter(Form.id == form_id, Form.created_by_id == user_id)
                .one()
            )
            self.db.delete(form_to_delete)
            self.db.commit()
        except sqlalchemy.exc.NoResultFound:
            raise NotFoundError(
                'Form not found or you are not authorized to delete it.'
            )
        except sqlalchemy.exc.SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError('Failed to delete form from database') from e

    def append_field_to_form(
        self, form_id: UUID, field_request: AppendFieldRequest, user_id: UUID
    ) -> AppendFieldResponse:
        """
        Append a new field to an existing form for clarification loop.
        Optionally marks a previous field as rejected if rejected_field_id is provided.
        """
        try:
            self.db.query(Form).filter(
                Form.id == form_id, Form.created_by_id == user_id
            ).one()

            if field_request.rejected_field_id:
                rejected_form_field = (
                    self.db.query(FormField)
                    .filter(
                        FormField.form_id == form_id,
                        FormField.field_id == field_request.rejected_field_id,
                    )
                    .one_or_none()
                )
                if rejected_form_field:
                    rejected_form_field.status = FieldStatusEnum.REJECTED
                else:
                    raise NotFoundError('Rejected field not found in this form')

            field_data = field_request.model_dump(exclude={'rejected_field_id'})
            new_field = Field(**field_data)
            self.db.add(new_field)
            self.db.flush()

            max_order = (
                self.db.query(FormField.order)
                .filter(FormField.form_id == form_id)
                .order_by(FormField.order.desc())
                .first()
            )
            next_order = (max_order[0] + 1) if max_order else 1

            form_field = FormField(
                field_id=new_field.id,
                form_id=form_id,
                order=next_order,
                status=FieldStatusEnum.PENDING,
            )
            self.db.add(form_field)

            self.db.commit()
            self.db.refresh(new_field)

            return AppendFieldResponse(
                success=True,
                message='Field successfully appended to form',
                field_id=new_field.id,
                form_id=form_id,
            )

        except sqlalchemy.exc.NoResultFound:
            raise NotFoundError('Form not found or you are not authorized to edit it.')
        except sqlalchemy.exc.SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError('Failed to append field to form') from e
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(
                f'An unexpected error occurred while appending field: {e}'
            )

    def get_submissions_for_creator(
        self, form_id: UUID, creator_id: UUID
    ) -> List[FullRespondedFormResponse]:
        form = (
            self.db.query(Form)
            .filter(Form.id == form_id, Form.created_by_id == creator_id)
            .first()
        )

        if not form:
            raise NotFoundError(
                'Form not found or you do not have permission to view its responses.'
            )
        submissions = (
            self.db.query(Submission).filter(Submission.form_id == form_id).all()
        )
        return self._enrich_submissions(submissions)

    def get_submission(
        self,
        form_id: UUID,
        receiver_id: UUID,
        respondent_id: UUID,
        current_user_id: UUID,
    ) -> FullRespondedFormResponse:
        submission = (
            self.db.query(Submission)
            .filter(
                Submission.form_id == form_id,
                Submission.receiver_id == receiver_id,
                Submission.respondent_id == respondent_id,
            )
            .one_or_none()
        )

        if not submission:
            raise NotFoundError('Submission not found for this user and form.')

        is_receiver = current_user_id == receiver_id
        is_respondent = current_user_id == submission.respondent_id
        if not (is_receiver or is_respondent):
            raise AuthorizationError('You are not authorised to access this submission')

        enriched_submission = self._enrich_submissions([submission])

        if not enriched_submission:
            raise NotFoundError('Could not enrich the submission details.')

        return enriched_submission[0]

    def get_all_my_received_feedback_forms(
        self, user_id: UUID
    ) -> List[FullRespondedFormResponse]:
        try:
            submissions = (
                self.db.query(Submission)
                .filter(Submission.receiver_id == user_id)
                .order_by(Submission.submitted_at.desc())
                .all()
            )
            return self._enrich_submissions(submissions)

        except sqlalchemy.exc.SQLAlchemyError as e:
            raise DatabaseError(
                'Failed to fetch received feedback from database'
            ) from e

    def expire_published_forms(self) -> dict:
        try:
            now = datetime.utcnow()
            forms_to_expire = (
                self.db.query(Form)
                .filter(Form.status == FormStatusEnum.PUBLISHED, Form.expires_at <= now)
                .all()
            )

            if not forms_to_expire:
                return {'message': 'No forms to expire.', 'expired_count': 0}

            expired_ids = []
            for form in forms_to_expire:
                form.status = FormStatusEnum.EXPIRED
                expired_ids.append(form.id)

                # TODO - action_item_service.generate_for_form(form.id)
                print(f'Form {form.id} has expired. Ready for action item generation.')

            self.db.commit()
            return {
                'message': f'Successfully expired {len(forms_to_expire)} forms.',
                'expired_ids': [str(fid) for fid in expired_ids],
            }

        except sqlalchemy.exc.SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError('Failed to process form expirations.') from e

    def _get_template(self, template_id: UUID, user_id: UUID) -> Template:
        template = (
            self.db.query(Template)
            .filter(Template.id == template_id, Template.created_by_id == user_id)
            .one_or_none()
        )
        if not template:
            raise NotFoundError('Template not found or not authorized')
        return template

    def _build_template_context(self, template: Template) -> str:
        context_parts = [f'Template Name: {template.name}']
        if template.category:
            context_parts.append(f'Category: {template.category}')
        if template.description:
            context_parts.append(f'Description: {template.description}')
        return ' | '.join(context_parts)

    def _create_fields_and_associations(
        self, form_id: UUID, generated_fields: List[dict]
    ) -> None:
        for order, field_data in enumerate(generated_fields, 1):
            field = Field(**field_data)
            self.db.add(field)
            self.db.flush()
            form_field = FormField(field_id=field.id, form_id=form_id, order=order)
            self.db.add(form_field)

    def _update_form_fields(self, form_id: UUID, fields_data: List[FieldEditRequest]):
        db_fields = {
            str(f.field_id): f
            for f in self.db.query(FormField).filter(FormField.form_id == form_id).all()
        }
        for field_update in fields_data:
            field_id_str = str(field_update.id)
            if field_id_str in db_fields:
                form_field_assoc = db_fields[field_id_str]
                if field_update.order is not None:
                    form_field_assoc.order = field_update.order

                field_obj = form_field_assoc.field
                update_data = field_update.model_dump(
                    exclude={'id', 'order'}, exclude_unset=True
                )
                for key, value in update_data.items():
                    setattr(field_obj, key, value)

    def _enrich_submissions(
        self, submissions: List[Submission]
    ) -> List[FullRespondedFormResponse]:
        from app.services.user_service import user_service

        if not submissions:
            return []

        user_ids_to_fetch = set()
        for sub in submissions:
            user_ids_to_fetch.add(sub.respondent_id)
            if sub.receiver_id:
                user_ids_to_fetch.add(sub.receiver_id)

        users_details = user_service.get_multiple_user_details(
            [str(uid) for uid in user_ids_to_fetch]
        )
        users_map = {
            UUID(user_id): UserInfo(
                id=details.id,
                name=details.user_metadata.get('name', 'N/A'),
                email=details.email,
            )
            for user_id, details in users_details.items()
        }

        all_field_ids = {
            answer['field_id']
            for sub in submissions
            for answer in sub.values
            if 'field_id' in answer
        }

        fields_by_id = {
            str(field.id): field
            for field in self.db.query(Field).filter(Field.id.in_(all_field_ids)).all()
        }

        enriched_responses = []
        for sub in submissions:
            enriched_values = []
            for answer_data in sub.values:
                field_id_str = str(answer_data.get('field_id'))
                field = fields_by_id.get(field_id_str)
                if field:
                    enriched_values.append(
                        FormFieldAnswerResponse(
                            field_id=field.id,
                            question=field.question,
                            value=answer_data.get('value'),
                        )
                    )

            respondent_info = users_map.get(sub.respondent_id)
            receiver_info = users_map.get(sub.receiver_id) if sub.receiver_id else None

            if not respondent_info:
                continue

            enriched_responses.append(
                FullRespondedFormResponse(
                    id=sub.id,
                    form_id=sub.form_id,
                    respondent=respondent_info,
                    submitted_at=sub.submitted_at,
                    receiver=receiver_info,
                    values=enriched_values,
                )
            )
        return enriched_responses

    def _send_form_notifications(self, form: Form, created_by_id: UUID):
        from app.services.user_service import user_service

        try:
            creator = user_service.get_user_info_from_id(created_by_id)
            creator_name = creator.name if creator else 'Someone'

            user_ids_to_notify = set()

            if form.respondents:
                user_ids_to_notify.update(form.respondents)

            if form.parties:
                for party in form.parties:
                    for member in party.members:
                        user_ids_to_notify.add(member.user_id)

            user_ids_to_notify.discard(created_by_id)

            for user_id in user_ids_to_notify:
                notification = Notification(
                    user_id=user_id,
                    type='form_assignment',
                    title='New Feedback Form Assigned',
                    message=f'{creator_name} has assigned you a new feedback form: "{form.title}"',
                    data={'form_id': str(form.id), 'form_title': form.title},
                )
                self.db.add(notification)

            self.db.commit()

        except Exception as e:
            print(f'Failed to send notifications: {e}')
            self.db.rollback()

    def _send_form_update_notifications(
        self, form: Form, updated_by_id: UUID, existing_users: set
    ):
        from app.services.user_service import user_service

        try:
            updater = user_service.get_user_info_from_id(updated_by_id)
            updater_name = updater.name if updater else 'Someone'

            current_user_ids = set()

            if form.respondents:
                current_user_ids.update(form.respondents)

            if form.parties:
                for party in form.parties:
                    for member in party.members:
                        current_user_ids.add(member.user_id)

            current_user_ids.discard(updated_by_id)

            new_user_ids = current_user_ids - existing_users

            for user_id in new_user_ids:
                notification = Notification(
                    user_id=user_id,
                    type='form_assignment',
                    title='New Feedback Form Assigned',
                    message=f'{updater_name} has assigned you a new feedback form: "{form.title}"',
                    data={'form_id': str(form.id), 'form_title': form.title},
                )
                self.db.add(notification)

            if new_user_ids:
                self.db.commit()

        except Exception as e:
            print(f'Failed to send update notifications: {e}')
            self.db.rollback()

    def _send_submission_notification(
        self, form: Form, submission: Submission, respondent_id: UUID
    ):
        from app.services.user_service import user_service

        try:
            respondent = user_service.get_user_info_from_id(respondent_id)
            respondent_name = respondent.name if respondent else 'A user'

            creator_id = form.created_by_id

            if creator_id == respondent_id:
                return

            notification = Notification(
                user_id=creator_id,
                type='form_submission',
                title='New Form Response',
                message=f'{respondent_name} has submitted a response to your form: "{form.title}"',
                data={
                    'form_id': str(form.id),
                    'form_title': form.title,
                    'submission_id': str(submission.id),
                    'respondent_id': str(respondent_id),
                    'respondent_name': respondent_name,
                },
            )
            self.db.add(notification)
            self.db.commit()

        except Exception as e:
            print(f'Failed to send submission notification: {e}')
            self.db.rollback()
