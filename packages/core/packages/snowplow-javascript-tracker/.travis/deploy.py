#!/usr/bin/env python

"""
Script responsible for deploying both snowplow-tracker-core and snowplow-tracker
Need to be executed in Travis CI environment by tag (core/x.y.z OR x.y.z)
Publish core locally, build tracker using locally publiched core and then
publish altogether
"""

from contextlib import contextmanager
import os
import sys
import subprocess


# Initial setup

if 'TRAVIS_TAG' in os.environ:
    TRAVIS_TAG = os.environ.get('TRAVIS_TAG')
else:
    sys.exit("Environment variable TRAVIS_TAG is unavailable")

if 'TRAVIS_BUILD_DIR' in os.environ:
    TRAVIS_BUILD_DIR = os.environ.get('TRAVIS_BUILD_DIR')
else:
    sys.exit("Environment variable TRAVIS_BUILD_DIR is unavailable")

if 'NPM_AUTH_TOKEN' in os.environ:
    NPM_AUTH_TOKEN = os.environ.get('NPM_AUTH_TOKEN')
else:
    sys.exit("Environment variable NPM_AUTH_TOKEN is unavailable")

if TRAVIS_TAG.startswith('core/'):
    PROJECT = 'core'
    VERSION = TRAVIS_TAG[5:]
else:
    PROJECT = 'tracker'
    VERSION = TRAVIS_TAG

    if 'AWS_ACCESS_KEY' in os.environ:
        AWS_ACCESS_KEY = os.environ.get('AWS_ACCESS_KEY')
    else:
        sys.exit("Environment variable AWS_ACCESS_KEY is unavailable (required for tracker publishing)")

    if 'AWS_SECRET_KEY' in os.environ:
        AWS_SECRET_KEY = os.environ.get('AWS_SECRET_KEY')
    else:
        sys.exit("Environment variable AWS_SECRET_KEY is unavailable (required for tracker publishing)")

    if 'AWS_S3_BUCKET' in os.environ:
        AWS_S3_BUCKET = os.environ.get('AWS_S3_BUCKET')
    else:
        sys.exit("Environment variable AWS_S3_BUCKET is unavailable (required for tracker publishing)")

    if 'AWS_REGION' in os.environ:
        AWS_REGION = os.environ.get('AWS_REGION')
    else:
        sys.exit("Environment variable AWS_REGION is unavailable (required for tracker publishing)")

    if 'AWS_CF_DISTRIBUTION' in os.environ:
        AWS_CF_DISTRIBUTION = os.environ.get('AWS_CF_DISTRIBUTION')
    else:
        sys.exit("Environment variable AWS_CF_DISTRIBUTION is unavailable (required for tracker publishing)")


# Helper functions

def output_if_error(sbt_output):
    """Callback to print stderr and fail deploy if exit status not successful"""
    (stdout, stderr) = sbt_output.communicate()
    if sbt_output.returncode != 0:
        print("Process has been failed.\n" + stdout)
        sys.exit(stderr)


def execute(command, callback=output_if_error):
    """Execute shell command with optional callback"""
    formatted_command = " ".join(command) if (type(command) == list) else command
    print("Executing [{0}]".format(formatted_command))
    output = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if hasattr(callback, '__call__'):
        return callback(output)
    else:
        return output


def check_version():
    """Fail deploy if tag version doesn't match SBT version"""
    if PROJECT == 'core':
        get_version = """var fs=require('fs'); fs.readFile('./core/package.json', 'utf8', function(e,d) { console.log(JSON.parse(d)['version']) });"""
    elif PROJECT == 'tracker':
        get_version = """var fs=require('fs'); fs.readFile('./package.json', 'utf8', function(e,d) { console.log(JSON.parse(d)['version']) });"""
    else:
        sys.exit("Unknown project " + str(PROJECT))

    node_output = execute(['node', '-e', get_version], None)
    print(node_output.stderr.read())
    for line in node_output.stdout.read().split("\n"):
        print(line)
        if line:
            if line != VERSION:
                sys.exit("Version extracted from TRAVIS_TAG [{0}] doesn't conform declared in package.json [{1}]".format(VERSION, line))
            else:
                return

    sys.exit("Cannot find version in core output:\n" + str(node_output))


@contextmanager
def npm_credentials():
    """Context manager allowing to use different credentials and delete them after use"""
    npmrc = os.path.expanduser("~/.npmrc")

    if os.path.isfile(npmrc):
        os.remove(npmrc)
        print("WARNING! ~/.npmrc already exists. It should be deleted after each use")
        print("Overrinding existing ~/.npmrc")
    else:
        print("Creating ~/.npmrc")

    with open(npmrc, 'a') as f:
        f.write("registry=http://registry.npmjs.org/\n//registry.npmjs.org/:_authToken=" + NPM_AUTH_TOKEN)

    yield

    print("Deleting ~/.npmrc")
    os.remove(npmrc)


@contextmanager
def aws_credentials():
    """Context manager allowing to use different credentials and delete them after use"""
    awsjson = os.path.join(TRAVIS_BUILD_DIR, "aws.json")

    if os.path.isfile(awsjson):
        sys.exit("aws.json already exists. It should be deleted after each use")
    else:
        print("Creating aws.json")
        with open(awsjson, 'a') as f:
            f.write(
                '{"key":"%(key)s","secret":"%(secret)s","bucket":"%(bucket)s","region":"%(region)s", "distribution":"%(distribution)s"}' % \
                    {'key': AWS_ACCESS_KEY, 'secret': AWS_SECRET_KEY, 'bucket': AWS_S3_BUCKET, 'distribution': AWS_CF_DISTRIBUTION, 'region': AWS_REGION}
            )

        yield

        print("Deleting aws.json")
        os.remove(awsjson)


def publish_core():
    os.chdir(os.path.join(TRAVIS_BUILD_DIR, "core"))
    with npm_credentials():
        execute(['npm', 'publish'])


def publish_tracker():
    os.chdir(TRAVIS_BUILD_DIR)
    with aws_credentials():
        execute(['grunt', 'publish'])


def publish():
    if PROJECT == 'core':
        publish_core()
    elif PROJECT == 'tracker':
        publish_tracker()
    else:
        sys.exit("Unknown project " + str(PROJECT))

if __name__ == "__main__":
    # Publish locally all dependencies
    check_version()
    publish()
