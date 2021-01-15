module.exports = function(grunt) {
  grunt.initConfig({
    browserify: {
      dist: {
        files: {
          'dist/vapors-wallet.js': [ 'index.js' ]
        },
        options: {
          browserifyOptions: {
            standalone: 'Wallet'
          }
        }
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/vapors-wallet.min.js' : [ 'dist/vapors-wallet.js' ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('dist', ['browserify', 'uglify']);
};
