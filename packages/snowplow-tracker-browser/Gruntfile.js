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

var semver = require('semver')

/*global module:false*/
module.exports = function(grunt) {
    var pkg = grunt.file.readJSON('package.json')
    var semVer = semver.parse(pkg.version)
    pkg.pinnedVersion = semVer.major

    grunt.initConfig({
        pkg: pkg,

        concat: {
            deploy: {
                options: {
                    report: 'gzip',
                    process: true,
                },
                src: ['dist/bundle-postbabel.js'],
                dest: 'dist/snowplow.js',
            },
            tag: {
                options: {
                    banner: ';',
                },
                src: ['tags/tag.min.js'],
                dest: 'tags/tag.min.js',
            },
            test: {
                options: {
                    process: true,
                },
                src: ['tests/pages/integration-template.html'],
                dest: 'tests/pages/integration.html',
            },
            local: {
                options: {
                    process: function(src, filepath) {
                        return src.replace(
                            /'\<\%= subdomain \%\>' \+ '\.ngrok\.io'/g,
                            '\'127.0.0.1:8000\''
                        )
                    },
                },
                src: ['tests/pages/integration-template.html'],
                dest: 'tests/local/serve/integration.html',
            },
        },

        uglify: {
            deploy: {
                options: {
                    banner: '<%= banner %>',
                },
                files: {
                    'dist/sp.js': ['dist/snowplow.js'],
                },
            },
            tag: {
                files: {
                    'tags/tag.min.js': ['tags/tag.js'],
                },
            },
        },

        intern: {
            // Common
            options: {
                config: 'tests/intern.js',
            },

            nonfunctional: {
                options: {
                    runType: 'client',
                    suites: [
                        'tests/nonfunctional/helpers.js',
                        'tests/nonfunctional/in_queue.js',
                        'tests/nonfunctional/proxies.js',
                    ],
                },
            },
            functional: {
                options: {
                    runType: 'runner',
                    functionalSuites: [
                        'tests/functional/detectors.js',
                        'tests/functional/helpers.js',
                    ],
                },
            },
            integration: {
                options: {
                    runType: 'runner',
                    functionalSuites: [
                        'tests/integration/setup.js', // required prior to integration.js
                        'tests/integration/integration.js', // request_recorder and ngrok need to be running
                    ],
                },
            },
        },
    })

    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-aws')
    grunt.loadNpmTasks('grunt-browserify')
    grunt.loadNpmTasks('intern')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-babel')

    grunt.registerTask(
        'upload_setup',
        'Read aws.json and configure upload tasks',
        function() {
            var aws = grunt.file.readJSON('aws.json')

            grunt.config('aws', aws)

            grunt.config('s3', {
                options: {
                    accessKeyId: '<%= aws.key %>',
                    secretAccessKey: '<%= aws.secret %>',
                    bucket: '<%= aws.bucket %>',
                    access: 'public-read',
                    region: '<%= aws.region %>',
                    gzip: true,
                    cache: false,
                },
                not_pinned: {
                    options: {
                        headers: {
                            CacheControl: 'max-age=315360000',
                        },
                    },
                    files: [
                        {
                            src: ['dist/sp.js'],
                            dest: '<%= pkg.version %>/sp.js',
                        },
                    ],
                },
                pinned: {
                    options: {
                        headers: {
                            CacheControl: 'max-age=3600',
                        },
                    },
                    files: [
                        {
                            src: ['dist/sp.js'],
                            dest: '<%= pkg.pinnedVersion %>/sp.js',
                        },
                    ],
                },
            })

            grunt.config('cloudfront', {
                options: {
                    accessKeyId: '<%= aws.key %>',
                    secretAccessKey: '<%= aws.secret %>',
                    distributionId: '<%= aws.distribution %>',
                },
                not_pinned: {
                    options: {
                        invalidations: ['/<%= pkg.version %>/sp.js'],
                    },
                },
                pinned: {
                    options: {
                        invalidations: ['/<%= pkg.pinnedVersion %>/sp.js'],
                    },
                },
            })
        }
    )

    grunt.registerTask('default', 'Build Browserify, add banner, and minify', [
        'browserify:main',
        'babel:dist',
        'concat:deploy',
        'uglify:deploy',
    ])
    grunt.registerTask(
        'publish',
        'Upload to S3 and invalidate Cloudfront (full semantic version only)',
        [
            'upload_setup',
            'browserify:main',
            'babel:dist',
            'concat:deploy',
            'uglify:deploy',
            's3:not_pinned',
            'cloudfront:not_pinned',
        ]
    )
    grunt.registerTask(
        'publish-pinned',
        'Upload to S3 and invalidate Cloudfront (full semantic version and semantic major version)',
        [
            'upload_setup',
            'browserify:main',
            'babel:dist',
            'concat:deploy',
            'uglify:deploy',
            's3',
            'cloudfront',
        ]
    )
    grunt.registerTask(
        'quick',
        'Build snowplow.js, skipping building and minifying',
        ['browserify:main', 'babel:dist', 'concat:deploy']
    )
    grunt.registerTask('test', 'Intern tests', [
        'browserify:test',
        'babel:test',
        'intern',
    ])
    grunt.registerTask('travis', 'Intern tests for Travis CI', [
        'concat:test',
        'browserify:test',
        'babel:test',
        'intern',
    ])
    grunt.registerTask('tags', 'Minifiy the Snowplow invocation tag', [
        'uglify:tag',
        'concat:tag',
    ])
    grunt.registerTask(
        'local',
        'Builds and places files read to serve and test locally',
        ['browserify:test', 'concat:local', 'babel:local']
    )
}
