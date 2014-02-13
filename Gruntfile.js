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
  " */\n\n"

  grunt.initConfig({

    banner: banner,

    pkg: pkg,

    aws: grunt.file.readJSON('aws.json'),

    concat: {
      dist: {
        options: {
          'report': 'gzip',
          'banner': '<%= banner %>'
        },
        src: ['src/js/banner.js',
              'src/js/init.js',
              'src/js/lib/cookie.js',
              'src/js/lib/context.js',
              'src/js/tracker.js',
              'src/js/snowplow.js',
              'src/js/constructor.js'],

        dest: 'dist/snowplow.js'
      }
    },

    browserify: {
      dist: {
        options: {
          alias: [
          'src/js/lib/identifiers.js:identifiers',
          'src/js/lib/helpers.js:helpers',
          'src/js/lib/payload.js:payload',
          'src/js/lib/cookie.js:cookie',
          'src/js/lib/context.js:detectors',
          'src/js/lib/jstz.js:jstz',
          'src/js/lib/sha1.js:sha1'
          ]
        },
        files: {
          'dist/bundle.js': ['dist/snowplow.js']
        }
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
          src: 'dist/bundle.js',
          dest: 'dist/sp.js'
          }
        ]
      }
    },

    s3: {
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
    },

    invalidate_cloudfront: {
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-yui-compressor');
  grunt.loadNpmTasks('grunt-s3');
  grunt.loadNpmTasks('grunt-invalidate-cloudfront');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['concat', 'browserify', 'min']);
  grunt.registerTask('publish', ['concat', 'min', 's3:not_pinned', 'invalidate_cloudfront:not_pinned']);
  grunt.registerTask('publish-pinned', ['concat', 'min', 's3', 'invalidate_cloudfront']);

}
