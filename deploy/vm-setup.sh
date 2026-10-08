#!/usr/bin/env bash
# Run ONCE on the e2-micro VM (Debian 12), as a user with sudo.
#   gcloud compute ssh rrpm-web --zone us-central1-a
#   bash vm-setup.sh
set -euo pipefail

DOMAIN="${DOMAIN:-roundrockpm.com}"
EMAIL="${CERT_EMAIL:-support@roundrockpm.com}"
WEBROOT="/var/www/roundrockpm"

echo "==> Updating packages"
sudo apt-get update -qq
sudo apt-get install -y nginx certbot python3-certbot-nginx ufw rsync

echo "==> Creating web root at ${WEBROOT}"
sudo mkdir -p "${WEBROOT}"
sudo chown -R "$USER":"$USER" "${WEBROOT}"

echo "==> Installing nginx site config"
sudo cp "$(dirname "$0")/nginx-roundrockpm.conf" /etc/nginx/sites-available/roundrockpm
sudo ln -sf /etc/nginx/sites-available/roundrockpm /etc/nginx/sites-enabled/roundrockpm
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "==> Firewall"
sudo ufw allow OpenSSH   >/dev/null 2>&1 || true
sudo ufw allow 'Nginx Full' >/dev/null 2>&1 || true
sudo ufw --force enable  >/dev/null 2>&1 || true

echo "==> Tuning nginx for a 1 GB shared-core VM"
sudo sed -i 's/^worker_processes.*/worker_processes 1;/' /etc/nginx/nginx.conf
sudo systemctl reload nginx

cat <<EOF

Next steps
----------
1. Point the DNS A record for ${DOMAIN} (and www) at this VM's external IP,
   then wait for it to resolve.
2. Upload the site:   ./deploy-site.sh
3. Enable HTTPS:      sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} -m ${EMAIL} --agree-tos --redirect
   Certbot installs a renewal timer automatically; check it with:
     systemctl list-timers | grep certbot
EOF
