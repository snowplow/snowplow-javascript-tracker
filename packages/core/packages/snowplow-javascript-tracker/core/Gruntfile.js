/*
* JavaScript tracker core for Snowplow: Gruntfile.js
*
 * Copyright (c) 2014 Snowplow Analytics Ltd. All rights reserved.
 *
 * This program is licensed to you under the Apache License Version 2.0,
 * and you may not use this file except in compliance with the Apache License Version 2.0.
 * You may obtain a copy of the Apache License Version 2.0 at http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the Apache License Version 2.0 is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Apache License Version 2.0 for the specific language governing permissions and limitations there under.
 */

/*global module:false*/
module.exports = function(grunt) {

  grunt.initConfig({

    intern: {
      nonfunctional: {
        options: {
          runType: 'client',
          config: 'tests/intern.js',
          suites: [
            'tests/base64.js',
            'tests/payload.js',
            'tests/core.js'
            ]
        }
      }
    }
  });

  grunt.loadNpmTasks('intern');

  grunt.registerTask('default', 'Run tests', ['intern']);
}
