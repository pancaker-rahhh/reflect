#!/usr/bin/env python3
"""
Script to insert test feedback data for testing feedback conversion functionality.
This script creates various types of feedback: responses, reviews, bug reports, and feature requests.
"""

import asyncio
from datetime import datetime, timezone
from uuid import uuid4, UUID
from typing import List

from app.db import get_db
from app.models.feedback_model import (
    FeedbackType,
    SurveyFeedback,
    ReviewFeedback,
    BugReportFeedback,
    FeatureRequestFeedback,
    NPSFeedback,
    CSATFeedback,
    CESFeedback,
)
from app.models.project_model import Project
from app.models.widget_model import Widget
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class TestFeedbackInserter:
    def __init__(self):
        self.project_id = None
        self.widget_id = None

    async def get_or_create_test_project_and_widget(
        self, db: AsyncSession
    ) -> tuple[UUID, UUID]:
        """Get or create a test project and widget for the feedback."""

        # Try to get an existing project
        result = await db.execute(select(Project).limit(1))
        project = result.scalar_one_or_none()

        if not project:
            print('❌ No projects found. Please create a project first.')
            return None, None

        self.project_id = project.id
        print(f'✅ Using project: {project.name} (ID: {self.project_id})')

        # Try to get an existing widget for this project
        result = await db.execute(
            select(Widget).where(Widget.project_id == self.project_id).limit(1)
        )
        widget = result.scalar_one_or_none()

        if not widget:
            print('❌ No widgets found for this project. Please create a widget first.')
            return None, None

        self.widget_id = widget.id
        print(f'✅ Using widget: {widget.name} (ID: {self.widget_id})')

        return self.project_id, self.widget_id

    async def insert_survey_feedback(
        self, db: AsyncSession, count: int = 5
    ) -> List[UUID]:
        """Insert test survey feedback (responses)."""
        feedback_ids = []

        survey_responses = [
            {
                'title': 'User Experience Survey Response',
                'message': 'The overall experience was good, but I think the navigation could be improved.',
                'rating': 4,
                'submitter_name': 'John Doe',
                'submitter_email': 'john.doe@example.com',
                'survey_type': 'user_experience',
                'score': 4,
                'response_data': {
                    'question_1': 'How satisfied are you with our product?',
                    'answer_1': 'Very satisfied',
                    'question_2': 'What could we improve?',
                    'answer_2': 'Better documentation and faster loading times',
                },
            },
            {
                'title': 'Product Feedback Survey',
                'message': 'Great product overall! The new features are exactly what I needed.',
                'rating': 5,
                'submitter_name': 'Jane Smith',
                'submitter_email': 'jane.smith@example.com',
                'survey_type': 'product_feedback',
                'score': 5,
                'response_data': {
                    'question_1': 'How likely are you to recommend us?',
                    'answer_1': 'Extremely likely',
                    'question_2': 'Favorite feature?',
                    'answer_2': 'The new dashboard layout',
                },
            },
            {
                'title': 'Customer Satisfaction Survey',
                'message': 'The product meets my needs but the pricing could be more competitive.',
                'rating': 3,
                'submitter_name': 'Mike Johnson',
                'submitter_email': 'mike.johnson@example.com',
                'survey_type': 'customer_satisfaction',
                'score': 3,
                'response_data': {
                    'question_1': 'How would you rate our support?',
                    'answer_1': 'Good',
                    'question_2': 'Any suggestions?',
                    'answer_2': 'Lower pricing for small businesses',
                },
            },
            {
                'title': 'Feature Usage Survey',
                'message': 'I use most features regularly. The mobile app could use some improvements.',
                'rating': 4,
                'submitter_name': 'Sarah Wilson',
                'submitter_email': 'sarah.wilson@example.com',
                'survey_type': 'feature_usage',
                'score': 4,
                'response_data': {
                    'question_1': 'Which features do you use most?',
                    'answer_1': 'Analytics and reporting',
                    'question_2': 'Mobile app rating?',
                    'answer_2': 'Could be better',
                },
            },
            {
                'title': 'Overall Experience Survey',
                'message': 'Excellent product! Keep up the great work.',
                'rating': 5,
                'submitter_name': 'David Brown',
                'submitter_email': 'david.brown@example.com',
                'survey_type': 'overall_experience',
                'score': 5,
                'response_data': {
                    'question_1': 'Overall satisfaction?',
                    'answer_1': 'Very satisfied',
                    'question_2': 'Would you renew?',
                    'answer_2': 'Absolutely',
                },
            },
        ]

        for i in range(min(count, len(survey_responses))):
            data = survey_responses[i]

            # Create base feedback
            feedback = SurveyFeedback(
                id=uuid4(),
                project_id=self.project_id,
                widget_id=self.widget_id,
                feedback_type=FeedbackType.SURVEY,
                title=data['title'],
                message=data['message'],
                rating=data['rating'],
                submitter_name=data['submitter_name'],
                submitter_email=data['submitter_email'],
                is_anonymous=False,
                is_actionable=True,
                survey_type=data['survey_type'],
                score=data['score'],
                response_data=data['response_data'],
                created_at=datetime.now(timezone.utc).replace(tzinfo=None),
                updated_at=datetime.now(timezone.utc).replace(tzinfo=None),
            )

            db.add(feedback)
            feedback_ids.append(feedback.id)

        await db.commit()
        print(f'✅ Inserted {len(feedback_ids)} survey feedback items')
        return feedback_ids

    async def insert_review_feedback(
        self, db: AsyncSession, count: int = 5
    ) -> List[UUID]:
        """Insert test review feedback."""
        feedback_ids = []

        reviews = [
            {
                'title': 'Amazing Product!',
                'message': 'This product has completely transformed how I work. The interface is intuitive and the features are exactly what I needed.',
                'rating': 5,
                'submitter_name': 'Alex Thompson',
                'submitter_email': 'alex.thompson@example.com',
                'overall_rating': 5,
                'pros': 'Great interface, excellent features, easy to use',
                'cons': 'None really',
                'is_published': True,
            },
            {
                'title': 'Good but needs improvement',
                'message': 'The product is solid but there are some bugs that need fixing. Customer support is responsive though.',
                'rating': 3,
                'submitter_name': 'Lisa Garcia',
                'submitter_email': 'lisa.garcia@example.com',
                'overall_rating': 3,
                'pros': 'Good features, responsive support',
                'cons': 'Some bugs, performance issues',
                'is_published': True,
            },
            {
                'title': 'Great value for money',
                'message': 'For the price, this product offers excellent value. The learning curve is minimal and results are immediate.',
                'rating': 4,
                'submitter_name': 'Robert Lee',
                'submitter_email': 'robert.lee@example.com',
                'overall_rating': 4,
                'pros': 'Good value, easy to learn, immediate results',
                'cons': 'Could have more advanced features',
                'is_published': False,
            },
            {
                'title': 'Could be better',
                'message': 'The concept is good but execution needs work. Performance issues and missing features are concerning.',
                'rating': 2,
                'submitter_name': 'Maria Rodriguez',
                'submitter_email': 'maria.rodriguez@example.com',
                'overall_rating': 2,
                'pros': 'Good concept, potential',
                'cons': 'Performance issues, missing features',
                'is_published': True,
            },
            {
                'title': 'Perfect for my needs',
                'message': 'Exactly what I was looking for. Simple, effective, and reliable. Highly recommend!',
                'rating': 5,
                'submitter_name': 'James Wilson',
                'submitter_email': 'james.wilson@example.com',
                'overall_rating': 5,
                'pros': 'Simple, effective, reliable',
                'cons': 'None',
                'is_published': True,
            },
        ]

        for i in range(min(count, len(reviews))):
            data = reviews[i]

            feedback = ReviewFeedback(
                id=uuid4(),
                project_id=self.project_id,
                widget_id=self.widget_id,
                feedback_type=FeedbackType.REVIEW,
                title=data['title'],
                message=data['message'],
                rating=data['rating'],
                submitter_name=data['submitter_name'],
                submitter_email=data['submitter_email'],
                is_anonymous=False,
                is_actionable=True,
                overall_rating=data['overall_rating'],
                pros=data['pros'],
                cons=data['cons'],
                is_published=data['is_published'],
                created_at=datetime.now(timezone.utc).replace(tzinfo=None),
                updated_at=datetime.now(timezone.utc).replace(tzinfo=None),
            )

            db.add(feedback)
            feedback_ids.append(feedback.id)

        await db.commit()
        print(f'✅ Inserted {len(feedback_ids)} review feedback items')
        return feedback_ids

    async def insert_bug_report_feedback(
        self, db: AsyncSession, count: int = 5
    ) -> List[UUID]:
        """Insert test bug report feedback."""
        feedback_ids = []

        bug_reports = [
            {
                'title': 'Login button not working on mobile',
                'message': "When I try to log in on my mobile device, the login button doesn't respond to taps. This happens on both iOS and Android.",
                'rating': 1,
                'submitter_name': 'Emma Davis',
                'submitter_email': 'emma.davis@example.com',
                'severity_level': 'high',
                'steps_to_reproduce': '1. Open app on mobile\n2. Enter credentials\n3. Tap login button\n4. Nothing happens',
                'expected_behavior': 'Login button should log me in and redirect to dashboard',
                'actual_behavior': 'Login button is unresponsive',
            },
            {
                'title': 'Data not saving properly',
                'message': "Sometimes when I save my work, the changes don't persist. I have to save multiple times to ensure it sticks.",
                'rating': 2,
                'submitter_name': 'Tom Anderson',
                'submitter_email': 'tom.anderson@example.com',
                'severity_level': 'medium',
                'steps_to_reproduce': '1. Make changes to document\n2. Click save\n3. Refresh page\n4. Changes are lost',
                'expected_behavior': 'Changes should be saved immediately',
                'actual_behavior': 'Changes are lost on page refresh',
            },
            {
                'title': 'Slow loading times',
                'message': 'The application is very slow to load, especially the dashboard. It takes 10+ seconds sometimes.',
                'rating': 2,
                'submitter_name': 'Rachel Green',
                'submitter_email': 'rachel.green@example.com',
                'severity_level': 'medium',
                'steps_to_reproduce': '1. Open application\n2. Navigate to dashboard\n3. Wait for loading',
                'expected_behavior': 'Dashboard should load within 2-3 seconds',
                'actual_behavior': 'Dashboard takes 10+ seconds to load',
            },
            {
                'title': 'Export feature broken',
                'message': "When I try to export my data as CSV, the file is corrupted and can't be opened in Excel.",
                'rating': 1,
                'submitter_name': 'Kevin Park',
                'submitter_email': 'kevin.park@example.com',
                'severity_level': 'high',
                'steps_to_reproduce': '1. Go to data section\n2. Click export\n3. Select CSV format\n4. Download file\n5. Try to open in Excel',
                'expected_behavior': 'CSV file should open properly in Excel',
                'actual_behavior': 'File is corrupted and shows error',
            },
            {
                'title': 'Notifications not appearing',
                'message': "I'm not receiving any notifications even though I have them enabled in settings.",
                'rating': 2,
                'submitter_name': 'Amanda Taylor',
                'submitter_email': 'amanda.taylor@example.com',
                'severity_level': 'low',
                'steps_to_reproduce': '1. Enable notifications in settings\n2. Trigger notification event\n3. Check if notification appears',
                'expected_behavior': 'Notifications should appear when enabled',
                'actual_behavior': 'No notifications appear',
            },
        ]

        for i in range(min(count, len(bug_reports))):
            data = bug_reports[i]

            feedback = BugReportFeedback(
                id=uuid4(),
                project_id=self.project_id,
                widget_id=self.widget_id,
                feedback_type=FeedbackType.BUG_REPORT,
                title=data['title'],
                message=data['message'],
                rating=data['rating'],
                submitter_name=data['submitter_name'],
                submitter_email=data['submitter_email'],
                is_anonymous=False,
                is_actionable=True,
                severity_level=data['severity_level'],
                steps_to_reproduce=data['steps_to_reproduce'],
                expected_behavior=data['expected_behavior'],
                actual_behavior=data['actual_behavior'],
                created_at=datetime.now(timezone.utc).replace(tzinfo=None),
                updated_at=datetime.now(timezone.utc).replace(tzinfo=None),
            )

            db.add(feedback)
            feedback_ids.append(feedback.id)

        await db.commit()
        print(f'✅ Inserted {len(feedback_ids)} bug report feedback items')
        return feedback_ids

    async def insert_feature_request_feedback(
        self, db: AsyncSession, count: int = 5
    ) -> List[UUID]:
        """Insert test feature request feedback."""
        feedback_ids = []

        feature_requests = [
            {
                'title': 'Dark mode theme',
                'message': 'Please add a dark mode theme option. My eyes get tired from the bright white interface during long work sessions.',
                'rating': 4,
                'submitter_name': 'Chris Miller',
                'submitter_email': 'chris.miller@example.com',
                'use_case': 'Reduce eye strain during long work sessions',
                'suggested_solution': 'Add a toggle in settings to switch between light and dark themes',
                'benefits': 'Better user experience, reduced eye strain, modern look',
                'implementation_status': 'not_started',
            },
            {
                'title': 'Bulk actions for data management',
                'message': 'It would be great to have bulk actions like delete, export, or move multiple items at once instead of doing them one by one.',
                'rating': 5,
                'submitter_name': 'Jennifer White',
                'submitter_email': 'jennifer.white@example.com',
                'use_case': 'Efficiently manage large amounts of data',
                'suggested_solution': 'Add checkboxes to select multiple items and bulk action buttons',
                'benefits': 'Saves time, improves productivity, better user experience',
                'implementation_status': 'not_started',
            },
            {
                'title': 'Advanced search and filtering',
                'message': 'The current search is too basic. We need advanced filters, date ranges, and saved search queries.',
                'rating': 4,
                'submitter_name': 'Mark Thompson',
                'submitter_email': 'mark.thompson@example.com',
                'use_case': 'Find specific data quickly and efficiently',
                'suggested_solution': 'Add advanced search panel with multiple filter options and save search functionality',
                'benefits': 'Faster data retrieval, better organization, improved workflow',
                'implementation_status': 'not_started',
            },
            {
                'title': 'Mobile app improvements',
                'message': 'The mobile app needs better offline support and faster sync when coming back online.',
                'rating': 3,
                'submitter_name': 'Sofia Martinez',
                'submitter_email': 'sofia.martinez@example.com',
                'use_case': 'Work on mobile devices with unreliable internet',
                'suggested_solution': 'Implement offline mode with local storage and smart sync',
                'benefits': 'Better mobile experience, work anywhere, improved reliability',
                'implementation_status': 'not_started',
            },
            {
                'title': 'Integration with popular tools',
                'message': 'Please add integrations with Slack, Microsoft Teams, and Google Workspace for better workflow integration.',
                'rating': 5,
                'submitter_name': 'Daniel Kim',
                'submitter_email': 'daniel.kim@example.com',
                'use_case': 'Seamless integration with existing work tools',
                'suggested_solution': 'Build API integrations and webhook support for popular platforms',
                'benefits': 'Better workflow integration, increased productivity, user retention',
                'implementation_status': 'not_started',
            },
        ]

        for i in range(min(count, len(feature_requests))):
            data = feature_requests[i]

            feedback = FeatureRequestFeedback(
                id=uuid4(),
                project_id=self.project_id,
                widget_id=self.widget_id,
                feedback_type=FeedbackType.FEATURE_REQUEST,
                title=data['title'],
                message=data['message'],
                rating=data['rating'],
                submitter_name=data['submitter_name'],
                submitter_email=data['submitter_email'],
                is_anonymous=False,
                is_actionable=True,
                use_case=data['use_case'],
                suggested_solution=data['suggested_solution'],
                benefits=data['benefits'],
                implementation_status=data['implementation_status'],
                created_at=datetime.now(timezone.utc).replace(tzinfo=None),
                updated_at=datetime.now(timezone.utc).replace(tzinfo=None),
            )

            db.add(feedback)
            feedback_ids.append(feedback.id)

        await db.commit()
        print(f'✅ Inserted {len(feedback_ids)} feature request feedback items')
        return feedback_ids

    async def insert_nps_feedback(self, db: AsyncSession, count: int = 3) -> List[UUID]:
        """Insert test NPS feedback."""
        feedback_ids = []

        nps_responses = [
            {
                'title': 'NPS Survey Response',
                'message': 'Great product! I would definitely recommend it to others.',
                'rating': 9,
                'submitter_name': 'Alice Johnson',
                'submitter_email': 'alice.johnson@example.com',
                'nps_score': 9,
                'promoter_category': 'promoter',
                'follow_up_comment': 'Great product, would definitely recommend!',
            },
            {
                'title': 'NPS Survey Response',
                'message': 'Good product but has room for improvement.',
                'rating': 7,
                'submitter_name': 'Bob Smith',
                'submitter_email': 'bob.smith@example.com',
                'nps_score': 7,
                'promoter_category': 'passive',
                'follow_up_comment': 'Good but could be better',
            },
            {
                'title': 'NPS Survey Response',
                'message': 'Not satisfied with the current state of the product.',
                'rating': 3,
                'submitter_name': 'Carol Davis',
                'submitter_email': 'carol.davis@example.com',
                'nps_score': 3,
                'promoter_category': 'detractor',
                'follow_up_comment': 'Not satisfied, needs improvement',
            },
        ]

        for i in range(min(count, len(nps_responses))):
            data = nps_responses[i]

            feedback = NPSFeedback(
                id=uuid4(),
                project_id=self.project_id,
                widget_id=self.widget_id,
                feedback_type=FeedbackType.NPS,
                title=data['title'],
                message=data['message'],
                rating=data['rating'],
                submitter_name=data['submitter_name'],
                submitter_email=data['submitter_email'],
                is_anonymous=False,
                is_actionable=True,
                nps_score=data['nps_score'],
                promoter_category=data['promoter_category'],
                follow_up_comment=data['follow_up_comment'],
                created_at=datetime.now(timezone.utc).replace(tzinfo=None),
                updated_at=datetime.now(timezone.utc).replace(tzinfo=None),
            )

            db.add(feedback)
            feedback_ids.append(feedback.id)

        await db.commit()
        print(f'✅ Inserted {len(feedback_ids)} NPS feedback items')
        return feedback_ids

    async def insert_csat_feedback(
        self, db: AsyncSession, count: int = 3
    ) -> List[UUID]:
        """Insert test CSAT feedback."""
        feedback_ids = []

        csat_responses = [
            {
                'title': 'Customer Satisfaction Survey',
                'message': 'Very satisfied with the support I received.',
                'rating': 5,
                'submitter_name': 'Eva Wilson',
                'submitter_email': 'eva.wilson@example.com',
                'csat_score': 5,
                'satisfaction_level': 'very_satisfied',
                'follow_up_comment': 'Quick response and helpful solution',
            },
            {
                'title': 'Customer Satisfaction Survey',
                'message': 'Satisfied but could be better.',
                'rating': 3,
                'submitter_name': 'Frank Brown',
                'submitter_email': 'frank.brown@example.com',
                'csat_score': 3,
                'satisfaction_level': 'satisfied',
                'follow_up_comment': 'Good but took too long to resolve',
            },
            {
                'title': 'Customer Satisfaction Survey',
                'message': 'Extremely satisfied with the service!',
                'rating': 5,
                'submitter_name': 'Grace Lee',
                'submitter_email': 'grace.lee@example.com',
                'csat_score': 5,
                'satisfaction_level': 'very_satisfied',
                'follow_up_comment': 'Exceeded expectations',
            },
        ]

        for i in range(min(count, len(csat_responses))):
            data = csat_responses[i]

            feedback = CSATFeedback(
                id=uuid4(),
                project_id=self.project_id,
                widget_id=self.widget_id,
                feedback_type=FeedbackType.CSAT,
                title=data['title'],
                message=data['message'],
                rating=data['rating'],
                submitter_name=data['submitter_name'],
                submitter_email=data['submitter_email'],
                is_anonymous=False,
                is_actionable=True,
                csat_score=data['csat_score'],
                satisfaction_level=data['satisfaction_level'],
                follow_up_comment=data['follow_up_comment'],
                created_at=datetime.now(timezone.utc).replace(tzinfo=None),
                updated_at=datetime.now(timezone.utc).replace(tzinfo=None),
            )

            db.add(feedback)
            feedback_ids.append(feedback.id)

        await db.commit()
        print(f'✅ Inserted {len(feedback_ids)} CSAT feedback items')
        return feedback_ids

    async def insert_ces_feedback(self, db: AsyncSession, count: int = 3) -> List[UUID]:
        """Insert test CES feedback."""
        feedback_ids = []

        ces_responses = [
            {
                'title': 'Customer Effort Score Survey',
                'message': 'It was very easy to complete my task.',
                'rating': 5,
                'submitter_name': 'Henry Taylor',
                'submitter_email': 'henry.taylor@example.com',
                'ces_score': 1,
                'ease_level': 'very_easy',
            },
            {
                'title': 'Customer Effort Score Survey',
                'message': 'Moderate effort required to complete the task.',
                'rating': 3,
                'submitter_name': 'Ivy Chen',
                'submitter_email': 'ivy.chen@example.com',
                'ces_score': 3,
                'ease_level': 'moderate',
            },
            {
                'title': 'Customer Effort Score Survey',
                'message': 'Very difficult to complete the task.',
                'rating': 1,
                'submitter_name': 'Jack Wilson',
                'submitter_email': 'jack.wilson@example.com',
                'ces_score': 5,
                'ease_level': 'very_difficult',
            },
        ]

        for i in range(min(count, len(ces_responses))):
            data = ces_responses[i]

            feedback = CESFeedback(
                id=uuid4(),
                project_id=self.project_id,
                widget_id=self.widget_id,
                feedback_type=FeedbackType.CES,
                title=data['title'],
                message=data['message'],
                rating=data['rating'],
                submitter_name=data['submitter_name'],
                submitter_email=data['submitter_email'],
                is_anonymous=False,
                is_actionable=True,
                ces_score=data['ces_score'],
                ease_level=data['ease_level'],
                created_at=datetime.now(timezone.utc).replace(tzinfo=None),
                updated_at=datetime.now(timezone.utc).replace(tzinfo=None),
            )

            db.add(feedback)
            feedback_ids.append(feedback.id)

        await db.commit()
        print(f'✅ Inserted {len(feedback_ids)} CES feedback items')
        return feedback_ids

    async def run(self):
        """Main method to insert all test feedback data."""
        print('🚀 Starting test feedback data insertion...')

        async for db in get_db():
            try:
                # Get or create test project and widget
                (
                    project_id,
                    widget_id,
                ) = await self.get_or_create_test_project_and_widget(db)
                if not project_id or not widget_id:
                    print('❌ Cannot proceed without project and widget')
                    return

                print('\n📊 Inserting test feedback data...')
                print('=' * 50)

                # Insert different types of feedback
                survey_ids = await self.insert_survey_feedback(db, 5)
                review_ids = await self.insert_review_feedback(db, 5)
                bug_ids = await self.insert_bug_report_feedback(db, 5)
                feature_ids = await self.insert_feature_request_feedback(db, 5)
                nps_ids = await self.insert_nps_feedback(db, 3)
                csat_ids = await self.insert_csat_feedback(db, 3)
                ces_ids = await self.insert_ces_feedback(db, 3)

                total_inserted = (
                    len(survey_ids)
                    + len(review_ids)
                    + len(bug_ids)
                    + len(feature_ids)
                    + len(nps_ids)
                    + len(csat_ids)
                    + len(ces_ids)
                )

                print('=' * 50)
                print(f'🎉 Successfully inserted {total_inserted} test feedback items!')
                print(f'   📝 Survey responses: {len(survey_ids)}')
                print(f'   ⭐ Reviews: {len(review_ids)}')
                print(f'   🐛 Bug reports: {len(bug_ids)}')
                print(f'   💡 Feature requests: {len(feature_ids)}')
                print(f'   📊 NPS feedback: {len(nps_ids)}')
                print(f'   😊 CSAT feedback: {len(csat_ids)}')
                print(f'   ⚡ CES feedback: {len(ces_ids)}')
                print('\n✅ You can now test the feedback conversion functionality!')

            except Exception as e:
                print(f'❌ Error inserting test data: {e}')
                await db.rollback()
            break


async def main():
    """Main entry point."""
    inserter = TestFeedbackInserter()
    await inserter.run()


if __name__ == '__main__':
    asyncio.run(main())
