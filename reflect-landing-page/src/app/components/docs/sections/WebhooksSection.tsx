import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import ContentCard from '@/app/components/docs/ContentCard';
import CodeBlock from '@/app/components/docs/CodeBlock';
import Note from '@/app/components/docs/Note';
import PlanCard from '@/app/components/docs/PlanCard';
import IntegrationCard from '@/app/components/docs/IntegrationCard';

const WebhooksSection = () => {
    const bugReportPayload = `{
  "event_type": "new_bug_report",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "webhook_id": "550e8400-e29b-41d4-a716-446655440000",
  "webhook_name": "Slack Integration",
  "program": {
    "name": "My App",
    "website_url": "https://myapp.com"
  },
  "data": {
    "id": "bug_12345",
    "title": "Button not working",
    "description": "The submit button doesn't respond when clicked",
    "severity": "medium",
    "status": "new",
    "reporter_email": "user@example.com",
    "reporter_name": "John Doe",
    "screenshot_url": "https://storage.feedbask.com/screenshots/...",
    "external_user_id": "user_789",
    "user_properties": {
      "plan": "premium",
      "company": "Acme Corp"
    },
    "user_context": {
      "page_url": "https://myapp.com/dashboard",
      "page_title": "Dashboard",
      "browser": "Chrome 120.0",
      "os": "Windows 10",
      "screen_size": "1920x1080"
    }
  }
}`;

    const featureRequestPayload = `{
  "event_type": "new_feature_request",
  "timestamp": "2024-01-15T10:35:00.000Z",
  "webhook_id": "550e8400-e29b-42d0-a716-446655440000",
  "data": {
    "id": "feature_07890",
    "title": "Dark mode support",
    "description": "Would love to have a dark mode option for nighttime use",
    "status": "new",
    "priority": "high",
    "upvotes": 0,
    "requester_email": "user@example.com",
    "requester_name": "Jane Smith",
    "external_user_id": "user_456",
    "user_properties": {
      "plan": "basic",
      "signup_date": "2024-01-01"
    }
  }
}`;

    const testWebhookPayload = `{
  "event_type": "test",
  "timestamp": "2024-01-15T10:40:00.000Z",
  "program_id": "prog_12345",
  "webhook_id": "550e8400-e29b-41d4-a716-446655440000",
  "webhook_name": "My Webhook",
  "data": {
    "message": "This is a test webhook from Feedbask",
    "test": true
  }
}`;

    const webhookHeaders = `Content-Type: application/json
User-Agent: Feedbask-Webhook/1.0
X-Feedbask-Event: new_bug_report
X-Feedbask-Delivery: 550e8400-e29b-41d4-a716-446655440000-1705316400000-1`;

    const slackIntegrationCode = `// webhook-handler.js
const express = require('express');
const axios = require('axios');
const app = express();

// Your Slack Webhook URL (store in environment variable)
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

app.use(express.json());

// Webhook endpoint that Feedbask will call
app.post('/webhooks/feedbask', async (req, res) => {
  try {
    const { event_type, data, program } = req.body;

    // Build Slack message based on event type
    let slackMessage;

    if (event_type === 'new_bug_report') {
      slackMessage = formatBugReportForSlack(data, program);
    } else if (event_type === 'new_feature_request') {
      slackMessage = formatFeatureRequestForSlack(data, program);
    } else if (event_type === 'test') {
      slackMessage = formatTestMessageForSlack(data);
    }

    // Send to Slack
    if (slackMessage) {
      await axios.post(SLACK_WEBHOOK_URL, slackMessage);
    }

    // Always respond quickly to Feedbask
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent retries if it's our error
    res.status(200).json({ received: true, error: true });
  }
});

// Format bug report using Slack Block Kit
function formatBugReportForSlack(data, program) {
  const severityEmoji = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢'
  };

  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🐛 New Bug Report",
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: \`*Title:*\n\${data.title}\`
          },
          {
            type: "mrkdwn",
            text: \`*Severity:*\n\${severityEmoji[data.severity] || '⚪'} \${data.severity}\`
          },
          {
            type: "mrkdwn",
            text: \`*Reporter:*\n\${data.reporter_name} (\${data.reporter_email})\`
          },
          {
            type: "mrkdwn",
            text: \`*Status:*\n\${data.status}\`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: \`*Description:*\n\${data.description}\`
        }
      },
      // Add context information if available
      ...(data.user_context ? [{
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: \`📱 \${data.user_context.browser} | 💻 \${data.user_context.os} | 📐 \${data.user_context.screen_size}\`
          }
        ]
      }] : []),
      // Add user properties if available
      ...(data.user_properties && Object.keys(data.user_properties).length > 0 ? [{
        type: "section",
        text: {
          type: "mrkdwn",
          text: \`*User Properties:*\n\${Object.entries(data.user_properties)
            .map(([key, value]) => \`• \${key}: \${value}\`)
            .join('\\n')}\`
        }
      }] : []),
      // Add action buttons
      {
        type: "actions",
        elements: [
          ...(data.screenshot_url ? [{
            type: "button",
            text: {
              type: "plain_text",
              text: "View Screenshot",
              emoji: true
            },
            url: data.screenshot_url,
            style: "primary"
          }] : []),
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View in Feedbask",
              emoji: true
            },
            url: \`\${program.website_url}/dashboard/bugs/\${data.id}\`
          }
        ]
      },
      {
        type: "divider"
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: \`From *\${program.name}* | Bug ID: \${data.id}\`
          }
        ]
      }
    ]
  };
}

// ... (formatFeatureRequestForSlack and formatTestMessageForSlack functions here)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Webhook handler running on port \${PORT}\`);
});
`;

    const threadingSupportCode = `// Store message timestamps to create threads
const messageThreads = new Map();

async function sendToSlackWithThreading(webhook, message, threadKey) {
  // Check if we have an existing thread
  const threadTs = messageThreads.get(threadKey);

  if (threadTs) {
    // Post as a reply in the thread
    message.thread_ts = threadTs;
  }

  const response = await axios.post(webhook, message);

  // Store the timestamp for future threading
  if (!threadTs && response.data.ts) {
    messageThreads.set(threadKey, response.data.ts);
  }

  return response;
}`;

    const customFilteringCode = `// Route to different channels based on severity/priority
const SLACK_CHANNELS = {
  critical: process.env.SLACK_CRITICAL_WEBHOOK,
  high: process.env.SLACK_HIGH_PRIORITY_WEBHOOK,
  normal: process.env.SLACK_GENERAL_WEBHOOK
};

function getWebhookBySeverity(severity) {
  if (severity === 'critical') return SLACK_CHANNELS.critical;
  if (severity === 'high') return SLACK_CHANNELS.high;
  return SLACK_CHANNELS.normal;
}`;

    const interactiveResponsesCode = `// Add interactive buttons with callback IDs
{
  type: "actions",
  elements: [
    {
      type: "button",
      text: { type: "plain_text", text: "Assign to Me" },
      action_id: "assign_bug",
      value: data.id,
    },
    {
      type: "button",
      text: { type: "plain_text", text: "Mark as Resolved" },
      action_id: "resolve_bug",
      value: data.id,
      style: "primary",
    },
    {
        type: "button",
        text: { type: "plain_text", text: "Create Jira Ticket" },
        action_id: "create_jira",
        value: data.id
    }
  ]
}`;

    return (
        <section id="webhooks" className="mb-16">
            <DocsHeader title="Webhooks" description="" />

            <ContentCard>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Webhook Overview</h3>
                <p className="text-gray-600 mb-4">Receive real-time notifications when new feedback is submitted.</p>
                <p className="text-gray-600 mb-4">Webhooks allow you to receive HTTP notifications whenever specific events occur in your Feedback program. This enables you to:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                    <li>Integrate feedback into your existing workflow tools (Slack, Discord, etc.)</li>
                    <li>Automatically create tickets in your issue tracking system</li>
                    <li>Build custom analytics and reporting dashboards</li>
                    <li>Trigger automated responses or workflows</li>
                </ul>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Supported Events</h4>
                    <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                        <li><strong>new_bug_report</strong> - When a user reports a bug</li>
                        <li><strong>new_feature_request</strong> - When a user requests a feature</li>
                    </ul>
                </div>
            </ContentCard>

            <ContentCard>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Setting Up Webhooks</h3>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-gray-800">Step 1: Navigate to Settings</h4>
                        <p className="text-gray-600">Go to your program dashboard and click on <strong>Settings → Integrations → Webhooks</strong></p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800">Step 2: Create a New Webhook</h4>
                        <p className="text-gray-600">Click "Add Webhook" and provide:</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
                            <li><strong>Name:</strong> A descriptive name for your webhook</li>
                            <li><strong>URL:</strong> Your endpoint URL (must be HTTPS for production)</li>
                            <li><strong>Events:</strong> Select which events should trigger this webhook</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800">Step 3: Test Your Webhook</h4>
                        <p className="text-gray-600">Use the "Test Webhook" button to send a test payload to your endpoint.</p>
                    </div>
                </div>
                <Note>
                    <strong>Security Note:</strong> Webhook URLs are encrypted before storage and all webhook payloads are sent over HTTPS.
                </Note>
            </ContentCard>

            <ContentCard>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Webhook Payload Format</h3>
                <p className="text-gray-600 mb-6">JSON payload structure sent to your endpoint.</p>

                <h4 className="text-lg font-semibold text-gray-800 mb-2">Bug Report Payload</h4>
                <CodeBlock code={bugReportPayload} />

                <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Feature Request Payload</h4>
                <CodeBlock code={featureRequestPayload} />

                <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Test Webhook Payload</h4>
                <CodeBlock code={testWebhookPayload} />
            </ContentCard>

            <ContentCard>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Webhook Headers</h3>
                <p className="text-gray-600 mb-4">HTTP headers included with webhook requests.</p>
                <p className="text-gray-600 mb-4">Each webhook request includes the following headers:</p>
                <CodeBlock code={webhookHeaders} />
                <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4 text-sm">
                    <li><strong>X-Feedbask-Event:</strong> The event type that triggered the webhook</li>
                    <li><strong>X-Feedbask-Delivery:</strong> Unique delivery ID (webhook_id-timestamp-attempt)</li>
                </ul>
            </ContentCard>

            <ContentCard>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Slack Integration Example</h3>
                <p className="text-gray-600 mb-4">Complete implementation guide for sending Feedbask notifications to Slack.</p>

                <h4 className="font-semibold text-gray-800">Step 1: Set Up Slack Incoming Webhook</h4>
                <ol className="list-decimal list-inside text-gray-600 space-y-2 my-2">
                    <li>Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">api.slack.com/apps</a> and click "Create New App".</li>
                    <li>Choose "From scratch" and name your app (e.g., "Feedbask Notifications").</li>
                    <li>Select your Slack workspace.</li>
                    <li>Navigate to "Features → Incoming Webhooks" and toggle it ON.</li>
                    <li>Click "Add New Webhook to Workspace".</li>
                    <li>Choose a channel (e.g., #feedback or #bug-reports).</li>
                    <li>Copy the Webhook URL (keep it secure!).</li>
                </ol>
                <Note><strong>Security Note:</strong> Your Webhook URL contains a secret token. Store it in environment variables, never commit it to your repository.</Note>

                <h4 className="font-semibold text-gray-800 mt-6">Step 2: Create Your Webhook Handler (Node.js/Express)</h4>
                <p className="text-gray-600 my-2">Create an endpoint to receive Feedbask webhooks and forward them to Slack with rich formatting:</p>
                <CodeBlock code={slackIntegrationCode} />

                <h4 className="font-semibold text-gray-800 mt-6">Step 3: Configure Environment Variables</h4>
                <CodeBlock code={`#.env file\nSLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX # gitleaks:allow\nPORT=3000`} />

                <h4 className="font-semibold text-gray-800 mt-6">Step 4: Deploy and Configure in Feedback</h4>
                <ol className="list-decimal list-inside text-gray-600 space-y-2 my-2">
                    <li>Deploy your webhook handler to a service like Vercel, Railway, or Heroku.</li>
                    <li>Get your public endpoint URL (e.g., https://your-app.herokuapp.com/webhooks/feedbask).</li>
                    <li>In Feedbask, go to Settings → Integrations → Webhooks.</li>
                    <li>Click "Add Webhook" and configure:</li>
                    <ul className="list-disc list-inside ml-6">
                        <li><strong>Name:</strong> Slack Integration</li>
                        <li><strong>URL:</strong> Your deployed endpoint URL</li>
                        <li><strong>Events:</strong> Select "Bug Reports" and "Feature Requests"</li>
                    </ul>
                    <li>Click "Test Webhook" to verify the integration.</li>
                </ol>
            </ContentCard>

            <ContentCard>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Features</h3>
                <h4 className="font-semibold text-gray-800 mt-6">Threading Support</h4>
                <p className="text-gray-600 my-2">Group related feedback in Slack threads:</p>
                <CodeBlock code={threadingSupportCode} />

                <h4 className="font-semibold text-gray-800 mt-6">Custom Filtering</h4>
                <p className="text-gray-600 my-2">Route different types of feedback to different Slack channels:</p>
                <CodeBlock code={customFilteringCode} />

                <h4 className="font-semibold text-gray-800 mt-6">Interactive Responses</h4>
                <p className="text-gray-600 my-2">Add interactive buttons for quick actions:</p>
                <CodeBlock code={interactiveResponsesCode} />
            </ContentCard>

            <ContentCard>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Security & Best Practices</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Security</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
                            <li>URLs encrypted at rest</li>
                            <li>HTTPS required</li>
                            <li>10-second timeout</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Best Practices</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
                            <li>Respond with 200 OK quickly</li>
                            <li>Process asynchronously</li>
                            <li>Use delivery ID for idempotency</li>
                        </ul>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mt-4"><strong>Retry Policy:</strong> Failed webhooks retry 3 times (1s, 2s, 4s delay). 4xx errors don't retry.</p>
            </ContentCard>

            <ContentCard>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Webhook Limits</h3>
                <p className="text-gray-600 mb-6">Webhook availability varies by plan:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <PlanCard title="Free Plan" price="Not available" description="Upgrade to Pro to enable webhooks" />
                    <PlanCard title="Pro Plan" price="5 webhooks per program" description="" />
                    <PlanCard title="Enterprise Plan" price="Unlimited webhooks" description="" />
                </div>
            </ContentCard>

            <ContentCard>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Common Use Cases</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <IntegrationCard icon="slack" title="Slack Integration" description="Send bug reports and feature requests directly to Slack channels for team visibility" />
                    <IntegrationCard icon="jira" title="Jira Integration" description="Automatically create Jira tickets from bug reports with all context included" />
                    <IntegrationCard icon="email" title="Email Notifications" description="Trigger custom email workflows for high-priority feedback" />
                    <IntegrationCard icon="analytics" title="Analytics Pipelines" description="Stream feedback data to your analytics tools for deeper insights" />
                </div>
            </ContentCard>

        </section>
    );
};

export default WebhooksSection;
