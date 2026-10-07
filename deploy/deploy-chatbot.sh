#!/usr/bin/env bash
# Build and deploy the Python chatbot to Cloud Run (scales to zero when idle).
set -euo pipefail

PROJECT="${PROJECT:?set PROJECT=your-gcp-project-id}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-rrpm-chat}"
SA_NAME="${SA_NAME:-rrpm-chat}"
SA="${SA_NAME}@${PROJECT}.iam.gserviceaccount.com"
SRC="$(cd "$(dirname "$0")/../chatbot" && pwd)"

echo "==> Deploying ${SERVICE} from ${SRC}"

gcloud run deploy "${SERVICE}" \
  --source "${SRC}" \
  --project "${PROJECT}" \
  --region "${REGION}" \
  --service-account "${SA}" \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 3 \
  --memory 512Mi \
  --cpu 1 \
  --concurrency 40 \
  --timeout 60 \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=${PROJECT},GOOGLE_CLOUD_LOCATION=${REGION},GEMINI_MODEL=${GEMINI_MODEL:-gemini-2.5-flash},ALLOWED_ORIGINS=${ALLOWED_ORIGINS:-https://roundrockpm.com,https://www.roundrockpm.com},OFFICE_EMAIL=${OFFICE_EMAIL:-support@roundrockpm.com},SMTP_HOST=${SMTP_HOST:-smtp.gmail.com},SMTP_PORT=${SMTP_PORT:-587},SMTP_USER=${SMTP_USER:-support@roundrockpm.com},SMTP_FROM=${SMTP_FROM:-support@roundrockpm.com}" \
  --set-secrets "SMTP_PASS=rrpm-smtp-pass:latest${DOORLOOP_SECRET:+,DOORLOOP_API_KEY=rrpm-doorloop-key:latest}"

URL=$(gcloud run services describe "${SERVICE}" --region "${REGION}" --project "${PROJECT}" --format='value(status.url)')
echo
echo "Service URL: ${URL}"
echo "Health:      curl ${URL}/healthz"
echo
echo "Now paste that URL into public/assets/js/config.js as API_BASE, then run deploy-site.sh"
