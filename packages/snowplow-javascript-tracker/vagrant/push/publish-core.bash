#!/bin/bash
set -e

# Similar to Perl die
function die() {
	echo "$@" 1>&2 ; exit 1;
}

# Check if our Vagrant box is running. Expects `vagrant status` to look like:
#
# > Current machine states:
# >
# > default                   poweroff (virtualbox)
# >
# > The VM is powered off. To restart the VM, simply run `vagrant up`
#
# Parameters:
# 1. out_running (out parameter)
function is_running {
	[ "$#" -eq 1 ] || die "1 argument required, $# provided"
	local __out_running=$1

	set +e
	vagrant status | sed -n 3p | grep -q "^default\s*running (virtualbox)$"
	local retval=${?}
	set -e
	if [ ${retval} -eq "0" ] ; then
		eval ${__out_running}=1
	else
		eval ${__out_running}=0
	fi
}

# Get version, checking we are on the latest
#
# Parameters:
# 1. out_version (out parameter)
# 2. out_error (out parameter)
function get_core_version {
	[ "$#" -eq 2 ] || die "2 arguments required, $# provided"
	local __out_version=$1
	local __out_error=$2

	# Extract the version from package.json using Node and save it in a file named "VERSION"
	vagrant ssh -c "cd /vagrant/core && node -e \"var fs=require('fs');fs.readFile('./package.json', 'utf8', function(e,d){console.log(JSON.parse(d)['version'])});\" > VERSION" \
	  || die "Failed to extract version information from package.json"
	file_version=`cat core/VERSION`
	expected_tag="core-$file_version"
	tag_version=`git describe --abbrev=0 --tags`
	if [ ${expected_tag} != ${tag_version} ] ; then
		eval ${__out_error}="'File version ${expected_tag} != tag version ${tag_version}'"
	else
		eval ${__out_version}=${expected_tag}
	fi
}

# Go to parent-parent dir of this script
function cd_root() {
	source="${BASH_SOURCE[0]}"
	while [ -h "${source}" ] ; do source="$(readlink "${source}")"; done
	dir="$( cd -P "$( dirname "${source}" )/../.." && pwd )"
	cd ${dir}
}

cd_root

# Precondition for running
running=0 && is_running "running"
[ ${running} -eq 1 ] || die "Vagrant guest must be running to push"

# Git tag must match version in package.json
version="" && error="" && get_core_version "version" "error"
[ "${error}" ] && die "Versions don't match: ${error}. Are you trying to publish an old version, or maybe on the wrong branch?"

vagrant ssh -c "cd /vagrant/core && npm adduser && npm publish"

exit 0
