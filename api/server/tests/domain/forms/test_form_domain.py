import pytest
from app.domain.forms.form import Form, TextField, NumberField, ChoiceField, FormResponse

def test_form_field_type_mapping():
    text_field = TextField(field_key="q1", label="Text")
    number_field = NumberField(field_key="q2", label="Number")
    choice_field = ChoiceField(field_key="q3", label="Check", choices=["a", "b", "c"], multiple=False)
    assert text_field.validate_answer("foo") == "foo"
    assert number_field.validate_answer(42) == 42
    assert choice_field.validate_answer("a") == "a"
    with pytest.raises(TypeError):
        number_field.validate_answer("not a number")
    with pytest.raises(ValueError):
        choice_field.validate_answer("not_a_choice")

def test_form_unique_field_keys():
    f1 = TextField(field_key="a", label="A")
    f2 = NumberField(field_key="b", label="B")
    form = Form(name="Test", fields=[f1, f2])

    print(form.model_dump_json())
    assert len(form.fields) == 2
    # Duplicate key should raise
    with pytest.raises(ValueError):
        Form(name="Test", fields=[f1, f1])

def test_form_response_type_safe():
    fields = [
        TextField(field_key="t", label="Text"),
        NumberField(field_key="n", label="Num"),
        ChoiceField(field_key="c", label="Check", choices=["yes", "no"], multiple=False),
    ]
    form = Form(name="F", fields=fields)
    resp = FormResponse(form=form, answers={"t": "hello", "n": 42, "c": "yes"})
    resp.validate_answers_type_safe()  # Should not raise

    # Wrong type for 'n'
    resp.answers["n"] = "not a number"
    with pytest.raises(TypeError):
        resp.validate_answers_type_safe()
    # Wrong value for 'c'
    resp.answers["n"] = 42
    resp.answers["c"] = "not_a_choice"
    with pytest.raises(ValueError):
        resp.validate_answers_type_safe()
