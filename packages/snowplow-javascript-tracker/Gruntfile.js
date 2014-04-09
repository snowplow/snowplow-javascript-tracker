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
  " * @author      <%= pkg.contributors %>\n" +
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
        dest: 'src/js/lib/lodash.js',
        options: {
          exports: 'node',
          include: 'isArray, isFunction, isString, isObject, isDate, isUndefined, isNull',
          flags: ['debug']
        }
      }
    },

    browserify: {
      dist: {
        files: {
          'dist/bundle.js': ['src/js/init.js']
        }
      }
    },

    concat: {
      dist: {
        options: {
          'report': 'gzip',
          'banner': '<%= banner %>'
        },
        src: ['dist/bundle.js'],

        dest: 'dist/snowplow.js'
      }
    },

    min: {
      dist: {
        options: {
          linebreak: 1000,
          report: 'gzip'
        },
        files: [
          {
          src: 'dist/snowplow.js',
          dest: 'dist/sp.js'
          }
        ]
      }
    },

    intern: {
      tests: {
        options: {
          runType: 'client',
          config: 'tests/intern.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-yui-compressor');
  grunt.loadNpmTasks('grunt-s3');
  grunt.loadNpmTasks('grunt-invalidate-cloudfront');
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
        upload: [
          {
            src: 'dist/sp.js',
            dest: '<%= pkg.version %>/sp.js'
          }
        ]
      },
      pinned: {
        upload: [
          {
            src: 'dist/sp.js',
            dest: '<%= pkg.pinnedVersion %>/sp.js'
          }        
        ]
      },  
    });

    grunt.config('invalidate_cloudfront', {
      options: {
        key: '<%= aws.key %>',
        secret: '<%= aws.secret %>',
        distribution: '<%= aws.distribution %>'
      },
      not_pinned: {
        files: [
          {
            src: ['<%= pkg.version %>/sp.js'],
            dest: ''
          }
        ]
      },
      pinned: {
        files: [
          {
            src: ['<%= pkg.pinnedVersion %>/sp.js'],
            dest: ''
          }
        ]
      }
    });
  });

  grunt.registerTask('default', 'Build lodash, Browserify, add banner, and minify', ['lodash', 'browserify', 'concat', 'min']);
  grunt.registerTask('publish', 'Upload to S3 and invalidate Cloudfront (full semantic version only)', ['upload_setup', 'concat', 'min', 's3:not_pinned', 'invalidate_cloudfront:not_pinned']);
  grunt.registerTask('publish-pinned', 'Upload to S3 and invalidate Cloudfront (full semantic version and semantic major version)', ['upload_setup', 'concat', 'min', 's3', 'invalidate_cloudfront']);
  grunt.registerTask('travis', 'Intern tests for Travis CI',  ['lodash','intern']);

}
