from typing import List
from uuid import UUID
import sqlalchemy.exc
from sqlalchemy.orm import Session
from app.core.exceptions import DatabaseError, NotFoundError
from app.models.models import Template
from app.models.schemas.template_schemas import TemplateRequest


class TemplateService:
    def __init__(self, db: Session):
        self.db = db

    def create_template(
        self, template_request: TemplateRequest, user_id: UUID
    ) -> Template:
        try:
            template = Template(
                name=template_request.name,
                description=template_request.description,
                category=template_request.category,
                created_by_id=user_id,
            )
            self.db.add(template)
            self.db.commit()
            self.db.refresh(template)
            return template
        except sqlalchemy.exc.SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError(f'Failed to create template in database: {str(e)}')
        except Exception:
            self.db.rollback()
            raise

    def get_user_templates(self, user_id: UUID) -> List[Template]:
        try:
            return (
                self.db.query(Template)
                .filter(Template.created_by_id == user_id)
                .order_by(Template.created_at.desc())
                .all()
            )
        except sqlalchemy.exc.SQLAlchemyError as e:
            raise DatabaseError(f'Failed to fetch templates from database: {str(e)}')

    def get_template_by_id(self, template_id: UUID, user_id: UUID) -> Template:
        try:
            template = (
                self.db.query(Template)
                .filter(Template.id == template_id, Template.created_by_id == user_id)
                .first()
            )
            if not template:
                raise NotFoundError('Template not found or not authorized')
            return template
        except sqlalchemy.exc.SQLAlchemyError as e:
            raise DatabaseError(f'Failed to fetch template from database: {str(e)}')

    def edit_template(
        self, template_id: UUID, template_request: TemplateRequest, user_id: UUID
    ) -> Template:
        try:
            template = self.get_template_by_id(template_id, user_id)

            update_data = template_request.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(template, key, value)

            self.db.commit()
            self.db.refresh(template)
            return template
        except sqlalchemy.exc.SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError(f'Failed to edit template in database: {str(e)}')
        except Exception:
            self.db.rollback()
            raise

    def delete_template(self, template_id: UUID, user_id: UUID) -> None:
        try:
            template = self.get_template_by_id(template_id, user_id)
            self.db.delete(template)
            self.db.commit()
        except sqlalchemy.exc.SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError(f'Failed to delete template from database: {str(e)}')
        except Exception:
            self.db.rollback()
            raise
