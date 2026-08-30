#!/bin/bash
cd /home/lead/www
npm install 2>&1
npm run build 2>&1
exec node dist/server.cjs
