module.exports = function(grunt) {

  grunt.initConfig({
    // CSS
    sass: {
      dist: {
        files: {
          'css/style.css': 'scss/main.scss',
        }
      }
    },

    shell: {
      dust_compile: {
        command: 'node compile.js'
      }
    },

    watch: {
      files: ['scss/**/*', 'templates/*', '*.md'],
      tasks: ['sass', 'shell:dust_compile']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['sass']);
};
