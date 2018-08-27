#!/usr/bin/env bash
VERSION=$1
FILENAME=sp-$VERSION-clv.js

if [ -z "$1" ]
  then
    echo "ERROR: No argument supplied, please pass a semver release, e.g. sh release 2.6.2"
    echo "INFO: Release not made"
    exit 1
fi

echo "creating release for $VERSION release of Clarivage Snowplow fork"

echo "create dist files using Snowplow Grunt build"
rm -rf ./dist/*.tgz ./dist/*-clv.js
npx grunt

echo "generate a zip file of ./dist/bundle.js for upload to AWS"
cd ./dist
cp sp.js $FILENAME
tar -czvf $FILENAME.tar.gz $FILENAME

echo "committing dist"
git commit -a -m "generating latest dist for $VERSION release"

echo "git tag release and push to master"
git tag -a $VERSION-clv -m "tagging forked release $VERSION-clv"
git push origin master --tags