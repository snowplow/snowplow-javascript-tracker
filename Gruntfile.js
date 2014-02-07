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
 *   notice, this list of conditions and the following disclaimer. 
 *
 * * Redistributions in binary form must reproduce the above copyright 
 *   notice, this list of conditions and the following disclaimer in the 
 *   documentation and/or other materials provided with the distribution. 
 *
 * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
 *   names of their contributors may be used to endorse or promote products
 *   derived from this software without specific prior written permission. 
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

/*global module:false*/
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    majorVersion: '<%= pkg.version.split(".")[0] %>',
    aws: grunt.file.readJSON('aws.json'),

    concat: {
      dist: {
        options: {
          'report': 'gzip'
        },
        src: ['src/js/banner.js',
              'src/js/lib/json.js',
              'src/js/lib/jstz.js',
              'src/js/init.js',
              'src/js/helpers.js',
              'src/js/cookie.js',
              'src/js/context.js',
              'src/js/lib/sha1.js',
              'src/js/lib/murmur.js',
              'src/js/lib/base64.js',
              'src/js/payload.js',
              'src/js/tracker.js',
              'src/js/snowplow.js',
              'src/js/constructor.js'],

        dest: 'dist/snowplow.js'
      }
    },

    min: {
      w_breaks: {
        options: {
          linebreak: 1000,
          report: 'gzip'
        },  
        files: [{
          src: 'dist/snowplow.js',
          dest: 'dist/sp.js'
        }]
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
      dev: {
        upload: [
          {
            src: 'dist/sp.js',
            dest: '<%= pkg.version %>/sp.js'
          },
          {
            src: 'dist/sp.js',
            dest: '<%= majorVersion %>/sp.js'
          }        
        ]
      }
    },

    invalidate_cloudfront: {
      options: {
        key: '<%= aws.key %>',
        secret: '<%= aws.secret %>',
        distribution:  '<%= aws.distribution %>'
      },
      production: {
        files: [{
          src: ['<%= majorVersion %>/sp.js'],
          dest: ''
        }, 
        {
          src: ['<%= pkg.version %>/sp.js'],
          dest: ''
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-yui-compressor');
  grunt.loadNpmTasks('grunt-s3');
  grunt.loadNpmTasks('grunt-invalidate-cloudfront');

  grunt.registerTask('default', ['concat', 'min']);
  grunt.registerTask('publish', ['concat', 'min', 's3', 'invalidate_cloudfront'])

}
