import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import PromptCard from '@/app/components/docs/PromptCard';
import GuidelinesCard from '@/app/components/docs/GuidelinesCard';
import InfoBox from '@/app/components/docs/InfoBox';
import ContentCard from '@/app/components/docs/ContentCard';
import CodeBlock from '@/app/components/docs/CodeBlock';

const UserIdentificationSection = () => {
    const benefits = [
        "Pre-fill user information: Name and email are automatically filled",
        "Link feedback to users: Track feedback from specific users in your dashboard",
        "Better analytics: Understand which users provide feedback",
        "Follow-up: Contact users about their feedback when needed",
    ];

    const useCases = [
        "SaaS applications: Track feedback from paid users",
        "E-commerce: Link reviews to customer accounts",
        "Support systems: Connect feedback to user profiles",
        "Internal tools: Track employee feedback",
    ];

    const identifyCode = `// Call this after a user logs into your site
window.feedback.identify({
  userId: 'user_12345',         // Required: A stable, unique ID from your system
  name: 'Ada Lovelace',          // Optional: Pre-fills name field
  email: 'ada@example.com',     // Optional: Pre-fills email field

  // You can add any other custom properties
  plan: 'premium',
  createdAt: '2023-10-27T10:00:00Z',
  department: 'Engineering'
});`;

    const cursorPrompt = `Please help me implement reflect user identification in my codebase. I need to:

1. **Call identify() after user login** - When a user successfully logs in, identify them to reflect
2. **Call identify() on page load** - If a user is already logged in when they visit the page
3. **Call unidentify() on logout** - Clear user identification when they log out

Here are the requirements:
- Use window.feedback.identify({ userId, name, email, ...otherProps }) to identify users
- Use window.feedback.unidentify() to clear identification on logout
- The userId should be a stable, unique ID from my database (not email or name)
- Name and email are optional but should be included if available
- Add proper error handling with try/catch blocks
- Ensure the widget has loaded before calling these functions

My current authentication setup:
- [Describe your login/logout system here - e.g., "I use NextAuth.js", "I have custom login functions", "I use Firebase Auth", etc.]
- [Describe how you detect if a user is logged in - e.g., "localStorage.getItem('user')", "useUser() hook", "cookies", etc.]
- [Describe your user object structure - e.g., "user has id, fullName, email properties"]

Please provide the specific code I need to add to my project, including:
1. Where to place the identify() call in my login flow
2. How to check for existing logged-in users on page load
3. Where to add the unidentify() call in my logout process
4. Error handling and widget readiness checks

Make sure the code is compatible with my tech stack and follows best practices.`;

    return (
        <section id="user-identification" className="mb-16">
            <DocsHeader
                title="User Identification"
                description=""
            />

            <PromptCard prompt={cursorPrompt} />

            <div className="my-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Identify Logged-in Users</h3>
                <p className="text-gray-600 mb-6">Link feedback to users in your system and pre-fill user information for a better experience.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GuidelinesCard type="success" title="Benefits" items={benefits} />
                    <InfoBox>
                        <h4 className="font-semibold text-blue-800 mb-2">Use Cases</h4>
                        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                            {useCases.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </InfoBox>
                </div>
            </div>

            <ContentCard>
                <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">1</div>
                    <div className="ml-4 flex-grow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Identify a User</h3>
                        <p className="mb-4 text-gray-600">Call the <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">identify</code> method after a user logs into your site:</p>
                        <CodeBlock code={identifyCode} />
                    </div>
                </div>
            </ContentCard>

        </section>
    );
};

export default UserIdentificationSection;
