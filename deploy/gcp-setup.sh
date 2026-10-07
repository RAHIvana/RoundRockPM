#!/usr/bin/env bash
# One-time Google Cloud setup: APIs, VM, firewall, static IP, service account.
# Run from your own machine with gcloud authenticated.
set -euo pipefail

PROJECT="${PROJECT:?set PROJECT=your-gcp-project-id}"
REGION="${REGION:-us-central1}"
ZONE="${ZONE:-us-central1-a}"
VM_NAME="${VM_NAME:-rrpm-web}"
SA_NAME="${SA_NAME:-rrpm-chat}"

gcloud config set project "${PROJECT}"

echo "==> Enabling APIs"
gcloud services enable compute.googleapis.com run.googleapis.com \
  artifactregistry.googleapis.com cloudbuild.googleapis.com \
  aiplatform.googleapis.com secretmanager.googleapis.com

echo "==> Reserving a static external IP"
gcloud compute addresses create "${VM_NAME}-ip" --region "${REGION}" 2>/dev/null || true
IP=$(gcloud compute addresses describe "${VM_NAME}-ip" --region "${REGION}" --format='value(address)')

echo "==> Creating the e2-micro web VM"
gcloud compute instances create "${VM_NAME}" \
  --zone "${ZONE}" \
  --machine-type e2-micro \
  --image-family debian-12 --image-project debian-cloud \
  --boot-disk-size 20GB --boot-disk-type pd-standard \
  --address "${IP}" \
  --tags http-server,https-server \
  --metadata enable-oslogin=TRUE 2>/dev/null || echo "   (VM already exists)"

echo "==> Firewall rules for HTTP/HTTPS"
gcloud compute firewall-rules create allow-http  --allow tcp:80  --target-tags http-server  2>/dev/null || true
gcloud compute firewall-rules create allow-https --allow tcp:443 --target-tags https-server 2>/dev/null || true

echo "==> Service account for the Cloud Run chatbot"
gcloud iam service-accounts create "${SA_NAME}" --display-name "Round Rock PM chatbot" 2>/dev/null || true
SA="${SA_NAME}@${PROJECT}.iam.gserviceaccount.com"
gcloud projects add-iam-policy-binding "${PROJECT}" --member "serviceAccount:${SA}" \
  --role roles/aiplatform.user --condition=None >/dev/null
gcloud projects add-iam-policy-binding "${PROJECT}" --member "serviceAccount:${SA}" \
  --role roles/secretmanager.secretAccessor --condition=None >/dev/null

cat <<EOF

Done.
  Static IP for DNS:  ${IP}
  Service account:    ${SA}

Point these DNS records at ${IP}:
  A   roundrockpm.com      ${IP}
  A   www.roundrockpm.com  ${IP}

Then SSH in and run vm-setup.sh:
  gcloud compute ssh ${VM_NAME} --zone ${ZONE}
EOF
