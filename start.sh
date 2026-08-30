#!/bin/bash
cd /home/lead/www
npm install --production 2>&1
exec node dist/server.cjs
