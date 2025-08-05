from typing import List
from uuid import UUID
import sqlalchemy
from sqlalchemy.orm import Session
from app.core.exceptions import DatabaseError, NotFoundError, LLMGenerationError
from app.models.models import Submission, ActionItem
from app.services.llm_service import get_llm_service


class ActionItemService:
    def __init__(self, db: Session):
        self.db = db
        self.llm_service = get_llm_service()

    # TODO - return a simpler object - GenerateActionItemsResponse
    def generate_action_items_from_submission(
        self, form_id: UUID, receiver_id: UUID
    ) -> List[ActionItem]:
        try:
            submission = (
                self.db.query(Submission)
                .filter(
                    Submission.form_id == form_id, Submission.receiver_id == receiver_id
                )
                .order_by(Submission.submitted_at.desc())
                .first()
            )

            if not submission:
                raise NotFoundError(
                    'No submission found for the given form and receiver'
                )

            generated_items = self.llm_service.generate_action_items(
                submission_data=submission.values
            )
            if not generated_items:
                raise LLMGenerationError('LLM failed to generate any action items.')

            new_action_items = []
            for item_data in generated_items:
                action_item = ActionItem(
                    title=item_data.get('title'),
                    description=item_data.get('description'),
                    category=item_data.get('category'),
                    submission_id=submission.id,
                    assignee_id=submission.receiver_id,
                )
                self.db.add(action_item)
                new_action_items.append(action_item)

            self.db.commit()
            for item in new_action_items:
                self.db.refresh(item)

            return new_action_items

        except sqlalchemy.exc.SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError('Failed to save action items') from e
        except Exception as e:
            self.db.rollback()
            raise e

    def get_action_items_for_assignee(self, assignee_id: UUID) -> List[ActionItem]:
        try:
            return (
                self.db.query(ActionItem)
                .filter(ActionItem.assignee_id == assignee_id)
                .all()
            )
        except sqlalchemy.exc.SQLAlchemyError as e:
            raise DatabaseError('Failed to retrieve action items') from e

    def get_action_item_by_id(
        self, action_item_id: UUID, assignee_id: UUID
    ) -> ActionItem:
        try:
            action_item = (
                self.db.query(ActionItem)
                .filter(
                    ActionItem.id == action_item_id,
                    ActionItem.assignee_id == assignee_id,
                )
                .first()
            )
            if not action_item:
                raise NotFoundError('Action item not found')
            return action_item
        except sqlalchemy.exc.SQLAlchemyError as e:
            raise DatabaseError('Failed to retrieve action item') from e

    def update_action_item(
        self, action_item_id: UUID, assignee_id: UUID, update_data: dict
    ) -> ActionItem:
        try:
            action_item = self.get_action_item_by_id(action_item_id, assignee_id)

            for field, value in update_data.items():
                if value is not None:
                    setattr(action_item, field, value)

            self.db.commit()
            self.db.refresh(action_item)
            return action_item

        except NotFoundError:
            raise
        except sqlalchemy.exc.SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError('Failed to update action item') from e
        except Exception as e:
            self.db.rollback()
            raise e

    def delete_action_item(self, action_item_id: UUID, assignee_id: UUID) -> None:
        try:
            action_item = self.get_action_item_by_id(action_item_id, assignee_id)
            self.db.delete(action_item)
            self.db.commit()

        except NotFoundError:
            raise
        except sqlalchemy.exc.SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError('Failed to delete action item') from e
        except Exception as e:
            self.db.rollback()
            raise e
