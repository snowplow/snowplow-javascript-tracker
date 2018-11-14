#!/bin/bash
cd core
grunt
cd ..
grunt
cp ./dist/snowplow.js ~/Dropbox/Tracker\ testing/JS/
