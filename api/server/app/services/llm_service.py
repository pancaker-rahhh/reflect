import logging
import json
import requests
from abc import ABC, abstractmethod
from typing import Dict, List, Any
import os
from dotenv import load_dotenv
from app.core.config import get_settings

load_dotenv()
logger = logging.getLogger(__name__)


class BaseLLMService(ABC):
    @abstractmethod
    def generate_fields(
        self,
        template_context: str,
        form_context: str,
        feedback_giver_persona: str = None,
        feedback_receiver_persona: str = None,
    ) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def generate_action_items(
        self, submission_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        pass

    def _build_form_prompt(
        self,
        template_context: str,
        form_context: str,
        feedback_giver_persona: str = None,
        feedback_receiver_persona: str = None,
    ) -> str:
        persona_context = ''
        if feedback_giver_persona and feedback_receiver_persona:
            persona_context = f"""
                                Feedback Context:
                                - Feedback Giver: {feedback_giver_persona}
                                - Feedback Receiver: {feedback_receiver_persona}

                                IMPORTANT: Frame all questions so that the {feedback_giver_persona} is answering questions ABOUT the {feedback_receiver_persona}.
                                The {feedback_giver_persona} should be able to provide actionable and non-trivial feedback about the {feedback_receiver_persona}.
                                """

        return f"""
                Create a feedback form with 8-12 relevant questions based on this context:
                Frame this such that {feedback_giver_persona} is giving feedback to {feedback_receiver_persona}
                Example: Student giving feedback to Teacher means the questions have to be structured like - "Does the teacher make it comfortable for you to ask questions during class?"

                Template Context: {template_context}
                Specific Form Context: {form_context}
                {persona_context}

                Generate questions that are:
                - Specific and actionable with clear behavioral focus
                - Appropriate for the context with varying depth levels
                - Non-trivial and meaningful, avoiding generic questions
                - Framed from the feedback giver's perspective about the feedback receiver
                - Diverse mix of question types (aim for balanced distribution)
                - Include both strengths-focused and improvement-focused questions
                - Range from surface-level observations to deeper insights
                - Address different competency areas (technical, interpersonal, leadership, etc.)
                - MUST include meaningful placeholders for all text fields

                CRITICAL INSTRUCTIONS:
                - Questions should be clear and direct WITHOUT examples
                - Questions should NOT contain "e.g." or examples - save those for placeholders
                - Keep questions concise and focused on what you're asking

                Supported question types (use varied distribution):
                - "text": Open-ended text input for detailed feedback (MUST have placeholder)
                - "rating": 1-5 scale rating for quantifiable assessments
                - "multiple_choice": Select one option for categorical responses
                - "boolean": Yes/No question for binary assessments

                QUESTION VARIETY GUIDELINES:
                - Use 3-4 text questions for detailed insights
                - Include 2-3 rating questions for measurable aspects
                - Add 1-2 multiple choice questions for structured responses
                - Include 1-2 boolean questions for clear yes/no scenarios
                - Balance questions across competency areas (technical, soft skills, leadership, etc.)
                - Mix surface-level and deeper analytical questions

                is_required should always be set to true

                CRITICAL PLACEHOLDER REQUIREMENTS FOR TEXT FIELDS:
                - Placeholders MUST provide concrete, specific examples
                - Include actionable details that guide the respondent
                - ALWAYS start with "e.g.," to show it's an example
                - Be contextually relevant to the question and personas
                - Help derive actionable insights from the feedback
                - Length: 50-150 characters for readability
                - Placeholders should contain the examples, NOT the questions

                PLACEHOLDER EXAMPLES BY CONTEXT:
                - Performance: "e.g., Exceeded Q3 targets by 15%, led 2 client presentations, mentored new team member"
                - Communication: "e.g., Clear in meetings, responds within 24hrs, could improve written documentation"
                - Student: "e.g., Shows curiosity in class, helps peers, struggles with time management"
                - Teamwork: "e.g., Takes initiative in brainstorming, supports others, sometimes dominates discussions"
                - Leadership: "e.g., Delegates effectively, motivates team, needs to provide clearer project timelines"
                - Technical: "e.g., Strong Python skills, learning React, should explore system design patterns"

                Return ONLY this JSON structure:
                {{
                  "fields": [
                    {{
                      "type": "rating",
                      "question": "How would you rate the student's participation in class discussions?",
                      "is_required": true,
                      "options": ["1", "2", "3", "4", "5"]
                    }},
                    {{
                      "type": "text",
                      "question": "What areas should the student focus on for improvement?",
                      "placeholder": "e.g., Time management for assignments, asking more questions in class, group collaboration skills",
                      "is_required": true
                    }},
                    {{
                      "type": "boolean",
                      "question": "Does the student consistently submit assignments on time?",
                      "is_required": true
                    }}
                  ]
                }}
                """

    def _build_action_item_prompt(self, submission_data: Dict[str, Any]) -> str:
        feedback_context = json.dumps(submission_data, indent=2)

        return f"""
        Analyze the following feedback submission, which contains a series of questions and the respondent's answers:

        ```json
        {feedback_context}
        ```

        Based on this feedback, identify key areas for improvement and generate 1-5 concrete and actionable items for the person who received the feedback.
        Address this to the receiver of feedback - you may use 'You'.
        Generate more than 1 only if each action you come up with is:
        - **Tangible:** A clear, achievable goal.
        - **Helpful:** Directly related to the feedback provided.
        - **Specific:** Avoid vague suggestions.
        - **Category:** Related to the categories from feedback submission

        Return ONLY a JSON object with a single key "action_items" that contains a list of these items. Each item must have "title", "description", and "category".

        Example JSON structure:
        {{
          "action_items": [
            {{
              "title": "Practice summarizing key takeaways in meetings",
              "description": "At the end of your next three project meetings, proactively offer to summarize the main decisions and next steps. This will improve clarity and demonstrate active listening.",
              "category": "Communication"
            }},
            {{
              "title": "Block out dedicated 'deep work' time",
              "description": "The feedback suggests that project deadlines are sometimes a challenge. Block 2-3 two-hour slots on your calendar each week for uninterrupted work on key project deliverables.",
              "category": "Time Management"
            }}
          ]
        }}
        """

    def _validate_and_clean_form_fields(
        self, fields: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        validated_fields = []
        supported_types = ['text', 'rating', 'multiple_choice', 'boolean']

        if not isinstance(fields, list):
            return []

        for field in fields:
            if not isinstance(field, dict):
                continue

            field_type = field.get('type')
            question = field.get('question')

            if not field_type or not question or field_type not in supported_types:
                continue

            validated_field = {
                'type': field_type,
                'question': str(question).strip(),
                'is_required': field.get('is_required', False),
                'placeholder': field.get('placeholder'),
                'options': field.get('options'),
            }

            if field_type == 'text' and not validated_field.get('placeholder'):
                question_lower = question.lower()
                if 'improve' in question_lower or 'area' in question_lower:
                    validated_field[
                        'placeholder'
                    ] = 'e.g., Communication skills, time management, technical knowledge'
                elif 'strength' in question_lower:
                    validated_field[
                        'placeholder'
                    ] = 'e.g., Problem solving, teamwork, attention to detail'
                elif 'example' in question_lower or 'describe' in question_lower:
                    validated_field[
                        'placeholder'
                    ] = 'e.g., Specific situation or behavior you observed'
                else:
                    validated_field[
                        'placeholder'
                    ] = 'e.g., Provide specific details and examples'

            if field_type == 'multiple_choice' and not field.get('options'):
                continue

            if field_type == 'rating':
                validated_field['options'] = field.get(
                    'options', ['1', '2', '3', '4', '5']
                )

            validated_fields.append(validated_field)

        return validated_fields[:12]

    def _validate_and_clean_action_items(
        self, items: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        validated_items = []
        if not isinstance(items, list):
            return []

        for item in items:
            if not isinstance(item, dict):
                continue

            title = item.get('title')
            if not title or not isinstance(title, str):
                continue

            validated_items.append(
                {
                    'title': title.strip(),
                    'description': str(item.get('description', '')).strip(),
                    'category': str(item.get('category', 'General')).strip(),
                }
            )

        return validated_items[:5]


class OllamaLLMService(BaseLLMService):
    def __init__(self, base_url: str = None, model: str = None):
        settings = get_settings()
        try:
            self.base_url = base_url or settings.LLM_URL
            self.model = model or settings.LLM_MODEL
        except AttributeError:
            raise ValueError('LLM_URL and LLM_MODEL must be set in settings')

    def _execute_generation(
        self, prompt: str, options: Dict[str, Any], timeout: int
    ) -> Dict[str, Any]:
        try:
            response = requests.post(
                f'{self.base_url}/api/generate',
                json={
                    'model': self.model,
                    'prompt': prompt,
                    'stream': False,
                    'options': options,
                },
                timeout=timeout,
            )
            response.raise_for_status()
            content = response.json()['response'].strip()

            if content.startswith('```json'):
                content = content.replace('```json', '').replace('```', '').strip()

            return json.loads(content)

        except json.JSONDecodeError as e:
            raise ValueError(f'Invalid JSON response from LLM: {e}')
        except requests.RequestException as e:
            raise RuntimeError(f'Ollama service error: {e}')
        except Exception as e:
            raise RuntimeError(f'An unexpected LLM service error occurred: {e}')

    def generate_fields(
        self,
        template_context: str,
        form_context: str,
        feedback_giver_persona: str,
        feedback_receiver_persona: str,
    ) -> List[Dict[str, Any]]:
        prompt = self._build_form_prompt(
            template_context,
            form_context,
            feedback_giver_persona,
            feedback_receiver_persona,
        )
        llm_options = {'temperature': 0.7, 'top_p': 0.9}
        parsed_response = self._execute_generation(prompt, llm_options, timeout=60)
        return self._validate_and_clean_form_fields(parsed_response.get('fields', []))

    def generate_action_items(
        self, submission_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        prompt = self._build_action_item_prompt(submission_data)
        llm_options = {'temperature': 0.3}
        parsed_response = self._execute_generation(prompt, llm_options, timeout=90)
        return self._validate_and_clean_action_items(
            parsed_response.get('action_items', [])
        )


def get_llm_service() -> BaseLLMService:
    llm_provider = os.getenv('LLM_PROVIDER', 'ollama')

    if llm_provider == 'ollama':
        return OllamaLLMService()

    raise ValueError(f'Unsupported LLM provider: {llm_provider}')
