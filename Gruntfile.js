module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    concat: {
      dist: {
        src: ['src/**/*.js'],
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