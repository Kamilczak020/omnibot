#!/bin/bash

DB_HOST = ""
DB_USER = ""
DB_NAME = ""
MIGRATION_ONLY = false

while getopts ":d:h:mu:" options; do
  case ${options} in
    d ) DB_NAME = ${OPTARG} ;;
    h ) DB_HOST = ${OPTARG} ;;
    m ) MIGRATION_ONLY = true ;;
    u ) DB_USERNAME = ${OPTARG} ;;
    : ) echo "Error: -${OPTARG} requires an argument."
        exit_abnormal ;;
    * ) exit_abnormal ;;
  esac
done
shift $((OPTIND -1))

if [ !MIGRATION_ONLY ] then
  exec psql -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -wf init-db.sql
fi

migration_files = ($(ls migrations/*.sql))

for file in ${migration_files}; do
  exec psql -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -wf "${file}"
  PID = $!
  wait ${PID}
done