#!/bin/bash

tag=$1
release=$tag

if [ "${release}" == "" ]; then
  echo "Warning! No release specified! Ignoring."
  exit 2
else
  if [ "${release:0:4}" == "core" ]; then
      echo "Core relase, not tracker"
  fi
fi
exit 0
