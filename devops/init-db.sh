#!/bin/bash

echo "Creating databases..."

mysql -u root -p$MYSQL_ROOT_PASSWORD <<MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS fed_ed;
CREATE DATABASE IF NOT EXISTS svc_auth;
CREATE DATABASE IF NOT EXISTS svc_admin;
MYSQL_SCRIPT

mongo <<MONGO_SCRIPT
use svc_log
MONGO_SCRIPT

echo "Databases created."