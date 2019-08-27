#!/bin/bash

tag=$1
release=$tag
trackerVersion=$(node -e 'const {version} = require("./package.json"); console.log(`${version}`);')

if [ "${release}" == "" ]; then
  echo "Warning! No release specified! Ignoring."
  exit 2
else
  if [ "${release:0:4}" == "core" ]; then
      echo "Core relase, not tracker"
elif [ "${release}" != "${trackerVersion}" ]; then
      echo "Tagged version ${release} does not equal tracker package version ${trackerVersion}"
  fi
fi
exit 0
