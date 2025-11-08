import uuid
from app.domain.forms.form import Form, TextField, NumberField, ChoiceField
from app.repositories.v2.forms_v2_repository import form_do_to_model_mapper


def test_form_do_to_model_mapper_text_and_number():
    form = Form(
        name="Test Form",
        description="desc",
        is_active=True,
        fields=[
            TextField(field_key="t1", label="Text", max_length=50, default_value="foo", order_index=1),
            NumberField(field_key="n1", label="Num", min_value=0, max_value=10, default_value=5, order_index=2),
        ],
    )
    project_id = uuid.uuid4()
    db_form = form_do_to_model_mapper(form, project_id)
    assert db_form.project_id == project_id
    assert db_form.name == "Test Form"
    assert db_form.description == "desc"
    assert db_form.is_active is True
    assert len(db_form.form_fields) == 2
    tf = db_form.form_fields[0]
    nf = db_form.form_fields[1]
    assert tf.field_type == "text"
    assert tf.validation_rules["max_length"] == 50
    assert tf.validation_rules["default"] == "foo"
    assert nf.field_type == "number"
    assert nf.validation_rules["min_value"] == 0
    assert nf.validation_rules["max_value"] == 10
    assert nf.validation_rules["default"] == 5

def test_form_do_to_model_mapper_choice():
    form = Form(
        name="Choice Form",
        fields=[
            ChoiceField(
                field_key="c1",
                label="Pick",
                choices=["a", "b", "c"],
                multiple=True,
                default_value=["a", "b"],
                order_index=0,
            )
        ],
    )
    project_id = uuid.uuid4()
    db_form = form_do_to_model_mapper(form, project_id)
    cf = db_form.form_fields[0]
    assert cf.field_type == "choice"
    assert cf.options == ["a", "b", "c"]
    assert cf.validation_rules["multiple"] is True
    assert cf.validation_rules["default"] == ["a", "b"]
