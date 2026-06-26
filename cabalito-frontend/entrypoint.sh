#!/bin/sh
set -e

# Start Next.js in background
HOSTNAME=0.0.0.0 node server.js &

# Start nginx in foreground
nginx -g "daemon off;"
