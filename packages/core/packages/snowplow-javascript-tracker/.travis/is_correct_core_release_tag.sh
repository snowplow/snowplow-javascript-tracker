#!/bin/bash

tag=$1
cicd=${tag:0:4}
release=${tag:5}
coreVersion=$(node -e 'const {version} = require("./core/package.json"); console.log(`${version}`);')

if [ "${cicd}" == "core" ]; then
  if [ "${release}" == "" ]; then
    echo "Warning! No release specified! Ignoring."
    exit 2
  elif [ "${release}" != "${coreVersion}" ]; then
      echo "Tagged version ${release} does not equal core package version ${coreVersion}"
      exit 1
  fi
  exit 0
else
  exit 1
fi
