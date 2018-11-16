#!/bin/bash
cd core
grunt
cd ..
grunt
cp ./dist/snowplow.js ~/Dropbox/Tracker\ testing/JS/
grunt concat:test
cp ./tests/pages/integration.html ~/Dropbox/Tracker\ testing/JS/
