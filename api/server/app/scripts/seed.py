from app.db import SessionLocal
from app.models.models import Template


DEFAULT_TEMPLATES = [
    {
        'name': 'Clarification Loop',
        'description': "Understand your partner's perspective on a specific event. Ask up to 7 clarifying questions to achieve clarity without starting a new argument.",
        'category': 'Relationship',
    },
]


def create_default_templates():
    db = SessionLocal()
    created_count = 0
    existing_count = 0

    try:
        for template_data in DEFAULT_TEMPLATES:
            existing_template = (
                db.query(Template)
                .filter(Template.name == template_data['name'])
                .first()
            )

            if not existing_template:
                new_template = Template(
                    name=template_data['name'],
                    description=template_data['description'],
                    category=template_data['category'],
                    created_by_id=None,
                )
                db.add(new_template)
                created_count += 1
                print(f"✅ Created default template: '{template_data['name']}'")
            else:
                existing_count += 1
                print(f"ℹ️  Template already exists: '{template_data['name']}'")

        if created_count > 0:
            db.commit()
            print(f'🎉 Successfully created {created_count} default template(s)')

        if existing_count > 0:
            print(f'📋 {existing_count} template(s) already existed')

    except Exception as e:
        db.rollback()
        print(f'❌ Error creating default templates: {e}')
        raise
    finally:
        db.close()
