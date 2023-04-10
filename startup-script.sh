#!/bin/bash

CONTAINER_ALREADY_STARTED="CONTAINER_ALREADY_STARTED_PLACEHOLDER"

if [ ! -e $CONTAINER_ALREADY_STARTED ]; then
    touch $CONTAINER_ALREADY_STARTED
    echo "-- First container startup --"
    yarn run prisma:migrate && sleep 2 && yarn db:dev:seed
else
    echo "-- Not first container startup --"
    yarn run prisma:migrate
fi

## add yarn start:dev in package.json