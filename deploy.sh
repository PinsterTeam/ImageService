#!/bin/bash

set -ex

echo "Called with stage: $1"

make all

docker run --rm --volume ${PWD}/lambda:/build amazonlinux:nodejs "npm install --production && ruby2.4 serverless.rb deploy $1 false"