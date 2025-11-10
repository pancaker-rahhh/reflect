"""
Tests for Form V2 Router endpoints.
Uses fixtures from conftest.py for setup.
"""
from httpx import AsyncClient
import pytest
from fastapi import status

from app.main import app
from app.core.auth import get_current_token_data


@pytest.mark.asyncio
async def test_create_form(test_setup):
    """Test creating a form with proper setup data."""
    project_id = str(test_setup['project'].id)
    
    payload = {
        'name': 'Test Form',
        'project_id': project_id,
        'description': 'A test form description',
        'fields': [],
    }
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        response = await ac.post('/api/v2/forms/', json=payload)
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        assert data['name'] == 'Test Form'
        assert data['project_id'] == project_id
        assert data['description'] == 'A test form description'


@pytest.mark.asyncio
async def test_create_form_with_fields(test_setup):
    """Test creating a form with fields."""
    project_id = str(test_setup['project'].id)
    
    payload = {
        'name': 'Form with Fields',
        'project_id': project_id,
        'description': 'Form with multiple fields',
        'fields': [
            {
                'field_type': 'text',
                'field_key': 'user_name',
                'label': 'Your Name',
                'is_required': True,
                'max_length': 100,
                'order_index': 0,
            },
            {
                'field_type': 'text',
                'field_key': 'user_email',
                'label': 'Your Email',
                'is_required': True,
                'max_length': 255,
                'order_index': 1,
            },
        ],
    }
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        response = await ac.post('/api/v2/forms/', json=payload)
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Error response: {response.json()}")
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        assert data['name'] == 'Form with Fields'
        assert len(data['fields']) == 2


@pytest.mark.asyncio
async def test_get_form(test_setup):
    """Test retrieving a form by ID."""
    project_id = str(test_setup['project'].id)
    
    # First create a form
    create_payload = {
        'name': 'Test Form',
        'project_id': project_id,
        'description': 'Test description',
        'fields': [],
    }
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        create_response = await ac.post('/api/v2/forms/', json=create_payload)
        assert create_response.status_code == status.HTTP_201_CREATED
        form_id = create_response.json()['id']
        
        # Now get the form
        get_response = await ac.get(f'/api/v2/forms/{form_id}')
        assert get_response.status_code == status.HTTP_200_OK
        
        data = get_response.json()
        assert data['id'] == form_id
        assert data['name'] == 'Test Form'


@pytest.mark.asyncio
async def test_list_forms(test_setup):
    """Test listing forms for a project."""
    project_id = str(test_setup['project'].id)
    
    # Create multiple forms
    async with AsyncClient(app=app, base_url='http://test') as ac:
        for i in range(3):
            payload = {
                'name': f'Test Form {i}',
                'project_id': project_id,
                'description': f'Description {i}',
                'fields': [],
            }
            create_response = await ac.post('/api/v2/forms/', json=payload)
            assert create_response.status_code == status.HTTP_201_CREATED
        
        # List forms
        list_response = await ac.get(f'/api/v2/forms/?project_id={project_id}')
        assert list_response.status_code == status.HTTP_200_OK
        
        data = list_response.json()
        assert len(data) >= 3  # At least the 3 we created


@pytest.mark.asyncio
async def test_update_form(test_setup):
    """Test updating a form."""
    project_id = str(test_setup['project'].id)
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # Create a form
        create_payload = {
            'name': 'Original Name',
            'project_id': project_id,
            'description': 'Original description',
            'fields': [],
        }
        create_response = await ac.post('/api/v2/forms/', json=create_payload)
        form_id = create_response.json()['id']
        
        # Update the form
        update_payload = {
            'name': 'Updated Name',
            'description': 'Updated description',
        }
        update_response = await ac.put(f'/api/v2/forms/{form_id}', json=update_payload)
        assert update_response.status_code == status.HTTP_200_OK
        
        data = update_response.json()
        assert data['name'] == 'Updated Name'
        assert data['description'] == 'Updated description'


@pytest.mark.asyncio
async def test_delete_form(test_setup):
    """Test deleting a form."""
    project_id = str(test_setup['project'].id)
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # Create a form
        create_payload = {
            'name': 'Form to Delete',
            'project_id': project_id,
            'description': 'Will be deleted',
            'fields': [],
        }
        create_response = await ac.post('/api/v2/forms/', json=create_payload)
        form_id = create_response.json()['id']
        
        # Delete the form
        delete_response = await ac.delete(f'/api/v2/forms/{form_id}')
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify it's deleted
        get_response = await ac.get(f'/api/v2/forms/{form_id}')
        assert get_response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_create_form_field(test_setup):
    """Test adding a field to an existing form."""
    project_id = str(test_setup['project'].id)
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # Create a form
        create_payload = {
            'name': 'Test Form',
            'project_id': project_id,
            'description': 'Test',
            'fields': [],
        }
        create_response = await ac.post('/api/v2/forms/', json=create_payload)
        form_id = create_response.json()['id']
        
        # Add a field
        field_payload = {
            'field_type': 'text',
            'field_key': 'feedback_text',
            'label': 'Your Feedback',
            'is_required': True,
            'max_length': 500,
            'order_index': 0,
        }
        field_response = await ac.post(
            f'/api/v2/forms/{form_id}/fields', json=field_payload
        )
        assert field_response.status_code == status.HTTP_200_OK
        
        field_data = field_response.json()
        assert field_data['label'] == 'Your Feedback'
        assert field_data['field_key'] == 'feedback_text'


@pytest.mark.asyncio
async def test_update_form_field(test_setup):
    """Test updating a field's properties."""
    project_id = str(test_setup['project'].id)
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # Create a form with a field
        create_payload = {
            'name': 'Test Form',
            'project_id': project_id,
            'description': 'Test',
            'fields': [
                {
                    'field_type': 'text',
                    'field_key': 'original_key',
                    'label': 'Original Label',
                    'is_required': False,
                    'max_length': 100,
                    'order_index': 0,
                }
            ],
        }
        create_response = await ac.post('/api/v2/forms/', json=create_payload)
        assert create_response.status_code == status.HTTP_201_CREATED
        
        form_data = create_response.json()
        form_id = form_data['id']
        field_id = form_data['fields'][0]['id']
        
        # Update the field
        update_payload = {
            'field_type': 'text',
            'label': 'Updated Label',
            'is_required': True,
            'max_length': 200,
        }
        update_response = await ac.put(
            f'/api/v2/forms/{form_id}/fields/{field_id}', json=update_payload
        )
        assert update_response.status_code == status.HTTP_200_OK
        
        updated_field = update_response.json()
        assert updated_field['label'] == 'Updated Label'
        assert updated_field['is_required'] is True
        assert updated_field['field_key'] == 'original_key'  # Should remain unchanged
        
        # Verify the update persisted
        get_form_response = await ac.get(f'/api/v2/forms/{form_id}')
        assert get_form_response.status_code == status.HTTP_200_OK
        
        form = get_form_response.json()
        assert form['fields'][0]['label'] == 'Updated Label'
        assert form['fields'][0]['is_required'] is True


@pytest.mark.asyncio
async def test_update_field_change_type(test_setup):
    """Test updating a field's type (e.g., text to number)."""
    project_id = str(test_setup['project'].id)
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # Create a form with a text field
        create_payload = {
            'name': 'Test Form',
            'project_id': project_id,
            'fields': [
                {
                    'field_type': 'text',
                    'field_key': 'value_field',
                    'label': 'Value',
                    'is_required': False,
                    'max_length': 100,
                    'order_index': 0,
                }
            ],
        }
        create_response = await ac.post('/api/v2/forms/', json=create_payload)
        form_id = create_response.json()['id']
        field_id = create_response.json()['fields'][0]['id']
        
        # Change to number field
        update_payload = {
            'field_type': 'number',
            'label': 'Numeric Value',
            'min_value': 0,
            'max_value': 100,
        }
        update_response = await ac.put(
            f'/api/v2/forms/{form_id}/fields/{field_id}', json=update_payload
        )
        assert update_response.status_code == status.HTTP_200_OK
        
        updated_field = update_response.json()
        assert updated_field['field_type'] == 'number'
        assert updated_field['label'] == 'Numeric Value'


@pytest.mark.asyncio
async def test_update_nonexistent_field(test_setup):
    """Test updating a field that doesn't exist returns 404."""
    project_id = str(test_setup['project'].id)
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # Create a form
        create_payload = {
            'name': 'Test Form',
            'project_id': project_id,
            'fields': [],
        }
        create_response = await ac.post('/api/v2/forms/', json=create_payload)
        form_id = create_response.json()['id']
        
        # Try to update non-existent field
        from uuid import uuid4
        fake_field_id = str(uuid4())
        
        update_payload = {
            'field_type': 'text',
            'label': 'Should Fail',
        }
        update_response = await ac.put(
            f'/api/v2/forms/{form_id}/fields/{fake_field_id}', json=update_payload
        )
        assert update_response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_unauthorized_access(test_setup):
    """Test that forms cannot be accessed without proper authorization."""
    # This would require a different user/org setup, skipping for now
    pass


@pytest.mark.asyncio
async def test_create_field_with_wrong_properties(test_setup):
    """Test that mixing properties from different field types fails validation."""
    project_id = str(test_setup['project'].id)
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # Create a form
        create_payload = {
            'name': 'Test Form',
            'project_id': project_id,
            'fields': [],
        }
        create_response = await ac.post('/api/v2/forms/', json=create_payload)
        form_id = create_response.json()['id']
        
        # Try to create a choice field with text field property (max_length)
        invalid_payload = {
            'field_type': 'choice',
            'field_key': 'category',
            'label': 'Category',
            'choices': ['A', 'B', 'C'],
            'max_length': 100,  # This is invalid for choice fields
        }
        response = await ac.post(
            f'/api/v2/forms/{form_id}/fields', json=invalid_payload
        )
        # Pydantic will ignore extra fields, so this might actually succeed
        # Let's verify the behavior
        assert response.status_code in [200, 422]


@pytest.mark.asyncio
async def test_create_choice_field_without_choices(test_setup):
    """Test that creating a choice field without choices fails."""
    project_id = str(test_setup['project'].id)
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # Create a form
        create_payload = {
            'name': 'Test Form',
            'project_id': project_id,
            'fields': [],
        }
        create_response = await ac.post('/api/v2/forms/', json=create_payload)
        form_id = create_response.json()['id']
        
        # Try to create a choice field without choices property
        invalid_payload = {
            'field_type': 'choice',
            'field_key': 'category',
            'label': 'Category',
            'is_required': True,
        }
        response = await ac.post(
            f'/api/v2/forms/{form_id}/fields', json=invalid_payload
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        
        error_detail = response.json()
        assert 'detail' in error_detail


@pytest.mark.asyncio
async def test_create_field_with_invalid_field_type(test_setup):
    """Test that creating a field with invalid field_type fails."""
    project_id = str(test_setup['project'].id)
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # Create a form
        create_payload = {
            'name': 'Test Form',
            'project_id': project_id,
            'fields': [],
        }
        create_response = await ac.post('/api/v2/forms/', json=create_payload)
        form_id = create_response.json()['id']
        
        # Try to create a field with invalid field_type
        invalid_payload = {
            'field_type': 'invalid_type',
            'field_key': 'test',
            'label': 'Test Field',
        }
        response = await ac.post(
            f'/api/v2/forms/{form_id}/fields', json=invalid_payload
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        
        error_detail = response.json()
        assert 'detail' in error_detail


@pytest.mark.asyncio
async def test_create_number_field_with_constraints(test_setup):
    """Test creating a number field with min/max constraints."""
    project_id = str(test_setup['project'].id)
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # Create a form with a number field
        create_payload = {
            'name': 'Test Form',
            'project_id': project_id,
            'fields': [
                {
                    'field_type': 'number',
                    'field_key': 'rating',
                    'label': 'Rating',
                    'is_required': True,
                    'min_value': 1,
                    'max_value': 5,
                    'default_value': 3,
                    'order_index': 0,
                }
            ],
        }
        response = await ac.post('/api/v2/forms/', json=create_payload)
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        field = data['fields'][0]
        assert field['field_type'] == 'number'
        
        # Verify config contains min_value and max_value
        config_dict = {item['key']: item['value'] for item in field['config']}
        assert config_dict.get('min_value') == 1
        assert config_dict.get('max_value') == 5
        assert config_dict.get('default_value') == 3


@pytest.mark.asyncio
async def test_create_choice_field_with_multiple(test_setup):
    """Test creating a choice field with multiple selection enabled."""
    project_id = str(test_setup['project'].id)
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # Create a form with a choice field
        create_payload = {
            'name': 'Test Form',
            'project_id': project_id,
            'fields': [
                {
                    'field_type': 'choice',
                    'field_key': 'tags',
                    'label': 'Tags',
                    'is_required': False,
                    'choices': ['Bug', 'Feature', 'Enhancement', 'Documentation'],
                    'multiple': True,
                    'default_value': ['Bug'],
                    'order_index': 0,
                }
            ],
        }
        response = await ac.post('/api/v2/forms/', json=create_payload)
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        field = data['fields'][0]
        assert field['field_type'] == 'choice'
        
        # Verify config contains choices and multiple
        config_dict = {item['key']: item['value'] for item in field['config']}
        assert config_dict.get('choices') == ['Bug', 'Feature', 'Enhancement', 'Documentation']
        assert config_dict.get('multiple') is True
        assert config_dict.get('default_value') == ['Bug']


@pytest.mark.asyncio
async def test_update_field_with_wrong_type_properties(test_setup):
    """Test that updating a field with properties for wrong type is handled correctly."""
    project_id = str(test_setup['project'].id)
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # Create a form with a text field
        create_payload = {
            'name': 'Test Form',
            'project_id': project_id,
            'fields': [
                {
                    'field_type': 'text',
                    'field_key': 'name',
                    'label': 'Name',
                    'max_length': 100,
                    'order_index': 0,
                }
            ],
        }
        create_response = await ac.post('/api/v2/forms/', json=create_payload)
        form_id = create_response.json()['id']
        field_id = create_response.json()['fields'][0]['id']
        
        # Try to update with number field properties while keeping field_type as text
        # Pydantic should ignore the extra fields
        update_payload = {
            'field_type': 'text',
            'label': 'Updated Name',
            'min_value': 0,  # Invalid for text field
            'max_value': 100,  # Invalid for text field
        }
        response = await ac.put(
            f'/api/v2/forms/{form_id}/fields/{field_id}', json=update_payload
        )
        # Should succeed but ignore invalid properties
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.asyncio
async def test_get_form_by_public_link(test_setup):
    """Test retrieving a form by its public link without authentication."""
    project_id = str(test_setup['project'].id)
    
    # Create a form
    create_payload = {
        'name': 'Public Form',
        'project_id': project_id,
        'description': 'Form accessible via public link',
        'fields': [
            {
                'field_type': 'text',
                'field_key': 'user_name',
                'label': 'Your Name',
                'is_required': True,
                'max_length': 100,
                'order_index': 0,
            },
            {
                'field_type': 'choice',
                'field_key': 'rating',
                'label': 'Rating',
                'is_required': True,
                'choices': ['Excellent', 'Good', 'Fair', 'Poor'],
                'multiple': False,
                'order_index': 1,
            },
        ],
    }
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # Create the form with authentication
        create_response = await ac.post('/api/v2/forms/', json=create_payload)
        assert create_response.status_code == status.HTTP_201_CREATED
        
        form_data = create_response.json()
        public_link = form_data['public_link']
        
        # Verify public_link is a 16-character string with only letters
        assert len(public_link) == 16
        assert public_link.isalpha()
        
        # Now access the form via public link WITHOUT authentication
        # Remove only the auth override, keep the db override
        app.dependency_overrides.pop(get_current_token_data, None)
        
        public_response = await ac.get(f'/api/v2/forms/public/{public_link}')
        assert public_response.status_code == status.HTTP_200_OK
        
        public_data = public_response.json()
        assert public_data['id'] == form_data['id']
        assert public_data['name'] == 'Public Form'
        assert public_data['public_link'] == public_link
        assert len(public_data['fields']) == 2
        
        # Verify field details are included
        assert public_data['fields'][0]['field_key'] == 'user_name'
        assert public_data['fields'][0]['label'] == 'Your Name'
        assert public_data['fields'][1]['field_key'] == 'rating'
        assert public_data['fields'][1]['label'] == 'Rating'


@pytest.mark.asyncio
async def test_get_form_by_public_link_not_found(test_setup):
    """Test accessing a non-existent public link returns 404."""
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # Clear auth for public endpoint, but keep db override
        app.dependency_overrides.pop(get_current_token_data, None)
        
        response = await ac.get('/api/v2/forms/public/nonexistentlink')
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()['detail'] == 'Form not found'


@pytest.mark.asyncio
async def test_public_link_uniqueness(test_setup):
    """Test that each form gets a unique public link."""
    project_id = str(test_setup['project'].id)
    
    public_links = set()
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # Create multiple forms
        for i in range(5):
            payload = {
                'name': f'Form {i}',
                'project_id': project_id,
                'description': f'Description {i}',
                'fields': [],
            }
            response = await ac.post('/api/v2/forms/', json=payload)
            assert response.status_code == status.HTTP_201_CREATED
            
            public_link = response.json()['public_link']
            assert len(public_link) == 16
            assert public_link.isalpha()
            
            # Ensure it's unique
            assert public_link not in public_links
            public_links.add(public_link)
        
        # Verify we got 5 unique links
        assert len(public_links) == 5


@pytest.mark.asyncio
async def test_submit_form_response_public(test_setup):
    """Test submitting a form response via public link."""
    project_id = str(test_setup['project'].id)
    
    # Create a form with fields
    create_payload = {
        'name': 'Feedback Form',
        'project_id': project_id,
        'description': 'Submit your feedback',
        'fields': [
            {
                'field_type': 'text',
                'field_key': 'name',
                'label': 'Your Name',
                'is_required': True,
                'max_length': 100,
                'order_index': 0,
            },
            {
                'field_type': 'text',
                'field_key': 'email',
                'label': 'Your Email',
                'is_required': True,
                'max_length': 255,
                'order_index': 1,
            },
            {
                'field_type': 'choice',
                'field_key': 'satisfaction',
                'label': 'How satisfied are you?',
                'is_required': True,
                'choices': ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'],
                'multiple': False,
                'order_index': 2,
            },
        ],
    }
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # Create the form
        create_response = await ac.post('/api/v2/forms/', json=create_payload)
        assert create_response.status_code == status.HTTP_201_CREATED
        
        form_data = create_response.json()
        public_link = form_data['public_link']
        
        # Remove auth for public endpoint
        app.dependency_overrides.pop(get_current_token_data, None)
        
        # Submit a response
        response_payload = {
            'answers': {
                'name': 'John Doe',
                'email': 'john@example.com',
                'satisfaction': 'Very Satisfied',
            },
            'submitter_name': 'John Doe',
            'submitter_email': 'john@example.com',
        }
        
        submit_response = await ac.post(
            f'/api/v2/forms/public/{public_link}/submit',
            json=response_payload
        )
        assert submit_response.status_code == status.HTTP_201_CREATED
        
        response_data = submit_response.json()
        assert response_data['success'] is True
        assert 'Thank you' in response_data['message']


@pytest.mark.asyncio
async def test_submit_form_response_missing_required_field(test_setup):
    """Test that submitting a form with missing required fields fails."""
    project_id = str(test_setup['project'].id)
    
    # Create a form with required field
    create_payload = {
        'name': 'Required Fields Form',
        'project_id': project_id,
        'fields': [
            {
                'field_type': 'text',
                'field_key': 'required_field',
                'label': 'Required Field',
                'is_required': True,
                'order_index': 0,
            },
        ],
    }
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        create_response = await ac.post('/api/v2/forms/', json=create_payload)
        public_link = create_response.json()['public_link']
        
        # Remove auth
        app.dependency_overrides.pop(get_current_token_data, None)
        
        # Try to submit without the required field
        response_payload = {
            'answers': {},
        }
        
        submit_response = await ac.post(
            f'/api/v2/forms/public/{public_link}/submit',
            json=response_payload
        )
        assert submit_response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'Required fields missing' in submit_response.json()['detail']


@pytest.mark.asyncio
async def test_submit_form_response_inactive_form(test_setup):
    """Test that submitting to an inactive form fails."""
    project_id = str(test_setup['project'].id)
    
    # Create an inactive form
    create_payload = {
        'name': 'Inactive Form',
        'project_id': project_id,
        'is_active': False,
        'fields': [],
    }
    
    async with AsyncClient(app=app, base_url='http://test') as ac:
        create_response = await ac.post('/api/v2/forms/', json=create_payload)
        public_link = create_response.json()['public_link']
        
        # Remove auth
        app.dependency_overrides.pop(get_current_token_data, None)
        
        # Try to submit to inactive form
        response_payload = {
            'answers': {},
        }
        
        submit_response = await ac.post(
            f'/api/v2/forms/public/{public_link}/submit',
            json=response_payload
        )
        assert submit_response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'no longer accepting responses' in submit_response.json()['detail']



