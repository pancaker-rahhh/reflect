export const bugReportPayload = `{
  "event_type": "new_bug_report",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "id": "bug_12345",
    "title": "Button not working",
    "description": "The submit button doesn't respond when clicked",
    "severity": "medium"
  }
}`;

export const featureRequestPayload = `{
  "event_type": "new_feature_request",
  "timestamp": "2024-01-15T10:35:00.000Z",
  "data": {
    "id": "feature_07890",
    "title": "Dark mode support",
    "description": "Would love to have a dark mode option for nighttime use"
  }
}`;

export const testWebhookPayload = `{
  "event_type": "test",
  "timestamp": "2024-01-15T10:40:00.000Z",
  "data": {
    "message": "This is a test webhook"
  }
}`;

export const slackIntegrationCode = `const express = require('express');
const axios = require('axios');
const app = express();

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

app.post('/webhooks/reflect', async (req, res) => {
  const { event_type, data } = req.body;
  let text = '';

  if (event_type === 'new_bug_report') {
    text = \`New Bug Report: \${data.title}\`;
  } else if (event_type === 'new_feature_request') {
    text = \`New Feature Request: \${data.title}\`;
  }

  if (text) {
    await axios.post(SLACK_WEBHOOK_URL, { text });
  }

  res.status(200).send('Received');
});

app.listen(3000, () => console.log('Webhook handler running'));`;
