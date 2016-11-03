#!/bin/bash

tag=$1
cicd=${tag:0:4}
release=${tag:5}

if [ "${cicd}" == "core" ]; then
  if [ "${release}" == "" ]; then
    echo "Warning! No release specified! Ignoring."
    exit 2
  fi
  exit 0
else
  exit 1
fi