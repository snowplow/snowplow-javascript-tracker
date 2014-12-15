/*
* JavaScript tracker for Snowplow: Gruntfile.js
*
* Significant portions copyright 2010 Anthon Pang. Remainder copyright
* 2012-2014 Snowplow Analytics Ltd. All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are
* met:
*
* * Redistributions of source code must retain the above copyright
* notice, this list of conditions and the following disclaimer.
*
* * Redistributions in binary form must reproduce the above copyright
* notice, this list of conditions and the following disclaimer in the
* documentation and/or other materials provided with the distribution.
*
* * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
* names of their contributors may be used to endorse or promote products
* derived from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
* "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
* LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
* A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
* OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
* SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
* LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
* DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
* THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var semver = require('semver');

/*global module:false*/
module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json');
  var semVer = semver.parse(pkg.version);
  pkg.pinnedVersion = semVer.major;
  var banner = "/*!" +
  " * Snowplow - The world's most powerful web analytics platform\n" +
  " *\n" +
  " * @description <%= pkg.description %>\n" +
  " * @version     <%= pkg.version %>\n" +
  " * @author      " + pkg.contributors.join(', ') +"\n" +
  " * @copyright   Anthon Pang, Snowplow Analytics Ltd\n" +
  " * @license     <%= pkg.license %>\n" +
  " */\n\n" +
  "/*\n" +
  " * For technical documentation:\n" +
  " * https://github.com/snowplow/snowplow/wiki/javascript-tracker\n" +
  " *\n" +
  " * For the setup guide:\n" +
  " * https://github.com/snowplow/snowplow/wiki/javascript-tracker-setup\n" +
  " * /\n" +
  "\n" +
  "/*\n" +
  " * Browser [In]Compatibility\n" +
  " * - minimum required ECMAScript: ECMA-262, edition 3\n" +
  " *\n" +
  " * Incompatible with these (and earlier) versions of:\n" +
  " * - IE4 - try..catch and for..in introduced in IE5\n" +
  " *- IE5 - named anonymous functions, array.push, encodeURIComponent, decodeURIComponent, and getElementsByTagName introduced in IE5.5\n" +
  " * - Firefox 1.0 and Netscape 8.x - FF1.5 adds array.indexOf, among other things\n" +
  " * - Mozilla 1.7 and Netscape 6.x-7.x\n" +
  " * - Netscape 4.8\n" +
  " * - Opera 6 - Error object (and Presto) introduced in Opera 7\n" +
  " * - Opera 7\n" +
  " */\n\n";

  grunt.initConfig({

    banner: banner,

    pkg: pkg,

    lodash: {
      build: {
        dest: 'src/js/lib_managed/lodash.js',
        options: {
          exports: 'node',
          include: 'isArray, isFunction, isString, isObject, isDate, isUndefined, isNull, map, filter, find, compact, isEmpty, clone',
          flags: ['debug']
        }
      }
    },

    browserify: {
      main: {
        files: {
          'deploy/bundle.js': ['src/js/init.js']
        }
      },
      test: {
        files: {
          'tests/pages/helpers.js': ['tests/scripts/helpers.js'],
          'tests/pages/detectors.js': ['tests/scripts/detectors.js']
        }
      }
    },

    concat: {
      deploy: {
        options: {
          'report': 'gzip',
          'banner': '<%= banner %>',
          'process': true
        },
        src: ['deploy/bundle.js'],
        dest: 'deploy/snowplow.js'
      },
      tag: {
        options: {
          banner: ';'
        },
        src: ['tags/tag.min.js'],
        dest: 'tags/tag.min.js'
      }
    },

    min: {
      deploy: {
        options: {
          linebreak: 1000,
          report: 'gzip'
        },
        files: [
          {
            src: 'deploy/snowplow.js',
            dest: 'deploy/sp.js'
          }
        ]
      },
      tag: {
        options: {
          linebreak: 80
        },
        files: [
          {
            src: 'tags/tag.js',
            dest: 'tags/tag.min.js'
          }
        ]
      }
    },

    intern: {
      nonfunctional: {
        options: {
          runType: 'client',
          config: 'tests/intern.js',
          suites: [
            'tests/nonfunctional/in_queue.js',
            'tests/nonfunctional/proxies.js'
            ]
        }
      },
      functional: {
        options: {
          runType: 'runner',
          config: 'tests/intern.js',
          functionalSuites: ['tests/functional/helpers.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-yui-compressor');
  grunt.loadNpmTasks('grunt-s3');
  grunt.loadNpmTasks('grunt-cloudfront');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('intern');
  grunt.loadNpmTasks('grunt-lodash');

  grunt.registerTask('upload_setup', 'Read aws.json and configure upload tasks', function() {
    var aws = grunt.file.readJSON('aws.json');

    grunt.config('aws', aws);

    grunt.config('s3', {
      options: {
        key: '<%= aws.key %>',
        secret: '<%= aws.secret %>',
        bucket: '<%= aws.bucket %>',
        access: 'public-read',
        gzip: true
      },
      not_pinned: {
        options: {
          headers: {
            'Cache-Control': 'max-age=315360000'
          }
        },
        upload: [
          {
            src: 'deploy/sp.js',
            dest: '<%= pkg.version %>/sp.js'
          }
        ]
      },
      pinned: {
        options: {
          headers: {
            'Cache-Control': 'max-age=3600'
          }
        },
        upload: [
          {
            src: 'deploy/sp.js',
            dest: '<%= pkg.pinnedVersion %>/sp.js'
          }        
        ]
      },  
    });

    grunt.config('cloudfront', {
      options: {
        region: 'eu-east-1',
        distributionId: '<%= aws.distribution %>',
        listInvalidations: true,
        listDistributions: true,
        credentials: {
          accessKeyId: '<%= aws.key %>',
          secretAccessKey: '<%= aws.secret %>'
        }
      },
      not_pinned: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: 1,
          Items: ['/<%= pkg.version %>/sp.js']
        }
      },
      pinned: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: 1,
          Items: ['/<%= pkg.pinnedVersion %>/sp.js']
        }
      }
    });
  });

  grunt.registerTask('default', 'Build lodash, Browserify, add banner, and minify', ['lodash', 'browserify:main', 'concat:deploy', 'min:deploy']);
  grunt.registerTask('publish', 'Upload to S3 and invalidate Cloudfront (full semantic version only)', ['upload_setup', 'lodash', 'browserify:main', 'concat:deploy', 'min:deploy', 's3:not_pinned', 'cloudfront:not_pinned']);
  grunt.registerTask('publish-pinned', 'Upload to S3 and invalidate Cloudfront (full semantic version and semantic major version)', ['upload_setup', 'lodash', 'browserify:main', 'concat:deploy', 'min:deploy', 's3', 'cloudfront']);
  grunt.registerTask('test', 'Intern tests', ['browserify:test', 'intern']);
  grunt.registerTask('travis', 'Intern tests for Travis CI',  ['lodash','browserify:test','intern']);
  grunt.registerTask('tags', 'Minifiy the Snowplow invocation tag', ['min:tag', 'concat:tag']);
}
