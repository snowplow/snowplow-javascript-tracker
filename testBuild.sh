#!/bin/bash
cd core
grunt
cd ..
grunt
cp ./dist/snowplow.js ~/Dropbox/Tracker\ testing/JS/
grunt concat:local
cp ./tests/pages/integration-local.html ~/Dropbox/Tracker\ testing/JS/integration.html
