#!/usr/bin/env bash
# Upload the static site from this folder to the e2-micro VM.
# Run from your own machine (needs gcloud installed and authenticated).
set -euo pipefail

VM_NAME="${VM_NAME:-rrpm-web}"
VM_ZONE="${VM_ZONE:-us-central1-a}"
WEBROOT="/var/www/roundrockpm"
SRC="$(cd "$(dirname "$0")/../public" && pwd)"

echo "==> Uploading ${SRC} to ${VM_NAME}:${WEBROOT}"

# --delete removes files on the server that no longer exist locally.
gcloud compute ssh "${VM_NAME}" --zone "${VM_ZONE}" --command "mkdir -p ${WEBROOT}"
gcloud compute scp --recurse --zone "${VM_ZONE}" "${SRC}/." "${VM_NAME}:${WEBROOT}/"
gcloud compute ssh "${VM_NAME}" --zone "${VM_ZONE}" --command \
  "sudo chown -R www-data:www-data ${WEBROOT} && sudo nginx -t && sudo systemctl reload nginx"

echo "==> Done. https://roundrockpm.com should now serve the new build."
