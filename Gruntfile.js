module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    concat: {
      dist: {
        src: [
          'src/js/banner.js',
          'src/js/lib/json.js',
          'src/js/lib/jstz.js',
          'src/js/init.js',
          'src/js/helpers.js',
          'src/js/lib/sha1.js',
          'src/js/lib/murmur.js',
          'src/js/lib/base64.js',
          'src/js/tracker.js',
          'src/js/snowplow.js',
          'src/js/constructor.js'
        ],
        dest: 'dist/snowplow.js'
      }
    },

    uglify: {
      options: {
        compress: {
          dead_code: true //removes dead code
        },
        wrap: true //creates a closure
      },
      dist: {
        src: 'dist/snowplow.js',
        dest: 'dist/snowplow.min.js',
        compress: true
      }
    }

  });

  grunt.registerTask('build', 'Build snowplow', function () {
    grunt.task.run('concat', 'uglify');

  });

};
