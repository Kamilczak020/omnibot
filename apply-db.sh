#!/bin/bash

DB_HOST=""
DB_USER=""
DB_NAME=""
DB_PASS=""
MIGRATION_ONLY=false

while getopts ":d:h:mp:u:" options; do
  case ${options} in
    d ) DB_NAME=${OPTARG} ;;
    h ) DB_HOST=${OPTARG} ;;
    m ) MIGRATION_ONLY=true ;;
    p ) DB_PASS=${OPTARG} ;;
    u ) DB_USER=${OPTARG} ;;
    : ) echo "Error: -${OPTARG} requires an argument."
        exit_abnormal ;;
    * ) exit_abnormal ;;
  esac
done
shift $((OPTIND -1))

if [ "${MIGRATION_ONLY}" = false ]; then
  eval env PGPASSWORD=${DB_PASS} psql -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -wf init-db.sql
  wait $!
fi

for file in migrations/*.sql; do
  eval env PGPASSWORD=${DB_PASS} psql -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -wf "${file}"
  wait $!
done