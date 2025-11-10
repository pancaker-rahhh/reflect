from typing import List, Optional, Union, Literal, Annotated
from pydantic import BaseModel, Field, model_validator


class BaseField(BaseModel):
    field_key: str
    label: str
    is_required: bool = False
    order_index: int = 0
    default_value: Optional[object] = None

    def validate_answer(self, v):
        return v


class TextField(BaseField):
    field_type: Literal['text'] = 'text'
    max_length: Optional[int] = None

    def validate_answer(self, v):
        if v is None:
            if self.is_required:
                raise ValueError(f"Field '{self.field_key}' is required.")
            return v
        if not isinstance(v, str):
            raise TypeError(f"Field '{self.field_key}' expects a string.")
        if self.max_length and len(v) > self.max_length:
            raise ValueError(
                f"Field '{self.field_key}' exceeds max_length {self.max_length}."
            )
        return v


class NumberField(BaseField):
    field_type: Literal['number'] = 'number'
    min_value: Optional[float] = None
    max_value: Optional[float] = None

    def validate_answer(self, v):
        if v is None:
            if self.is_required:
                raise ValueError(f"Field '{self.field_key}' is required.")
            return v
        if not isinstance(v, (int, float)):
            raise TypeError(f"Field '{self.field_key}' expects a number.")
        if self.min_value is not None and v < self.min_value:
            raise ValueError(
                f"Field '{self.field_key}' value {v} < min_value {self.min_value}."
            )
        if self.max_value is not None and v > self.max_value:
            raise ValueError(
                f"Field '{self.field_key}' value {v} > max_value {self.max_value}."
            )
        return v


class ChoiceField(BaseField):
    field_type: Literal['choice'] = 'choice'
    choices: List[str]
    multiple: bool = False

    def validate_answer(self, v):
        if v is None:
            if self.is_required:
                raise ValueError(f"Field '{self.field_key}' is required.")
            return v
        if self.multiple:
            if not isinstance(v, list) or not all(isinstance(i, str) for i in v):
                raise TypeError(f"Field '{self.field_key}' expects a list of strings.")
            invalid = [i for i in v if i not in self.choices]
            if invalid:
                raise ValueError(
                    f"Field '{self.field_key}' has invalid choices: {invalid}."
                )
            return v
        else:
            if not isinstance(v, str):
                raise TypeError(f"Field '{self.field_key}' expects a string.")
            if v not in self.choices:
                raise ValueError(f"Field '{self.field_key}' has invalid choice: {v}.")
            return v


# Discriminated union for automatic parsing
FormField = Annotated[
    Union[TextField, NumberField, ChoiceField],
    Field(discriminator='field_type'),
]


class Form(BaseModel):
    """
    Domain model for a form, containing a list of form fields.
    """

    name: str
    description: Optional[str] = None
    is_active: bool = True
    public_link: Optional[str] = None
    fields: List[FormField] = Field(default_factory=list)

    @model_validator(mode='after')
    def check_unique_field_keys(self):
        keys = [f.field_key for f in self.fields]
        if len(keys) != len(set(keys)):
            raise ValueError('All field_key values in fields must be unique.')
        return self

    def add_field(self, field: FormField):
        if any(f.field_key == field.field_key for f in self.fields):
            raise ValueError(
                f"Field key '{field.field_key}' already exists in this form."
            )
        self.fields.append(field)
        self.fields.sort(key=lambda f: f.order_index)

    def remove_field(self, field_key: str):
        self.fields = [f for f in self.fields if f.field_key != field_key]

    def get_field(self, field_key: str) -> Optional[BaseField]:
        for f in self.fields:
            if f.field_key == field_key:
                return f
        return None


class FormResponse(BaseModel):
    """
    Domain model for a response to a form.
    Stores answers keyed by field_key, and references the full Form object.
    """

    form: Form
    answers: dict[str, object] = Field(
        default_factory=dict, description='User answers keyed by field_key'
    )

    def get_answer(self, field_key: str) -> object | None:
        return self.answers.get(field_key)

    def set_answer(self, field_key: str, value: object):
        self.answers[field_key] = value

    def validate_answers_type_safe(self):
        """
        Validates that each answer matches the expected type for its field.
        Raises TypeError or ValueError if any answer does not match.
        """
        for field in self.form.fields:
            answer = self.answers.get(field.field_key)
            field.validate_answer(answer)

    class Config:
        arbitrary_types_allowed = True
