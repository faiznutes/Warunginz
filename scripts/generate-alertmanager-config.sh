#!/bin/bash
# Generate Alertmanager configuration from environment variables
# Usage: ./scripts/generate-alertmanager-config.sh

set -e

CONFIG_DIR="monitoring/alertmanager"
TEMPLATE_FILE="${CONFIG_DIR}/alertmanager.yml.template"
OUTPUT_FILE="${CONFIG_DIR}/alertmanager.yml"

# Check if template exists
if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "Error: Template file not found: $TEMPLATE_FILE"
  exit 1
fi

# Load environment variables from .env if exists
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Create output file from template
cp "$TEMPLATE_FILE" "$OUTPUT_FILE"

# Replace placeholders if environment variables are set
if [ -n "$SLACK_WEBHOOK_URL" ]; then
  sed -i "s|# slack_api_url:.*|slack_api_url: '$SLACK_WEBHOOK_URL'|g" "$OUTPUT_FILE"
  sed -i "s|#     - api_url:.*|    - api_url: '$SLACK_WEBHOOK_URL'|g" "$OUTPUT_FILE"
fi

if [ -n "$SMTP_HOST" ] && [ -n "$SMTP_PORT" ]; then
  sed -i "s|# smtp_smarthost:.*|smtp_smarthost: '${SMTP_HOST}:${SMTP_PORT}'|g" "$OUTPUT_FILE"
fi

if [ -n "$SMTP_FROM" ]; then
  sed -i "s|# smtp_from:.*|smtp_from: '${SMTP_FROM}'|g" "$OUTPUT_FILE"
fi

if [ -n "$SMTP_USERNAME" ]; then
  sed -i "s|# smtp_auth_username:.*|smtp_auth_username: '${SMTP_USERNAME}'|g" "$OUTPUT_FILE"
fi

if [ -n "$SMTP_PASSWORD" ]; then
  sed -i "s|# smtp_auth_password:.*|smtp_auth_password: '${SMTP_PASSWORD}'|g" "$OUTPUT_FILE"
fi

if [ -n "$ALERT_EMAIL_TO" ]; then
  sed -i "s|#   - to:.*|  - to: '${ALERT_EMAIL_TO}'|g" "$OUTPUT_FILE"
fi

if [ -n "$SLACK_CHANNEL" ]; then
  sed -i "s|#     channel: '#alerts'|    channel: '#${SLACK_CHANNEL}'|g" "$OUTPUT_FILE"
fi

if [ -n "$SLACK_CHANNEL_CRITICAL" ]; then
  sed -i "s|#     channel: '#alerts-critical'|    channel: '#${SLACK_CHANNEL_CRITICAL}'|g" "$OUTPUT_FILE"
fi

# Uncomment email_configs if SMTP is configured
if [ -n "$SMTP_HOST" ] && [ -n "$ALERT_EMAIL_TO" ]; then
  sed -i "s|# email_configs:|email_configs:|g" "$OUTPUT_FILE"
  sed -i "s|#   - to:|  - to:|g" "$OUTPUT_FILE"
  sed -i "s|#     headers:|    headers:|g" "$OUTPUT_FILE"
  sed -i "s|#       Subject:|      Subject:|g" "$OUTPUT_FILE"
  sed -i "s|#     html:|    html:|g" "$OUTPUT_FILE"
  sed -i "s|#     send_resolved:|    send_resolved:|g" "$OUTPUT_FILE"
fi

# Uncomment slack_configs if Slack is configured
if [ -n "$SLACK_WEBHOOK_URL" ]; then
  sed -i "s|# slack_configs:|slack_configs:|g" "$OUTPUT_FILE"
  sed -i "s|#   - api_url:|  - api_url:|g" "$OUTPUT_FILE"
  sed -i "s|#     channel:|    channel:|g" "$OUTPUT_FILE"
  sed -i "s|#     title:|    title:|g" "$OUTPUT_FILE"
  sed -i "s|#     text:|    text:|g" "$OUTPUT_FILE"
  sed -i "s|#     send_resolved:|    send_resolved:|g" "$OUTPUT_FILE"
  sed -i "s|#     color:|    color:|g" "$OUTPUT_FILE"
fi

echo "Alertmanager configuration generated: $OUTPUT_FILE"
echo "Please review the configuration before deploying."

