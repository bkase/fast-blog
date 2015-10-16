module.exports = function(grunt) {

  grunt.initConfig({
    // CSS
    sass: {
      dist: {
        files: {
          'www/css/style.css': 'scss/main.scss',
        }
      }
    },

    shell: {
      dust_compile: {
        command: 'node compile.js'
      },
      cp_images: {
        command: 'mkdir -p www/images && cp images/* www/images'
      }
    },

    watch: {
      files: ['scss/**/*', 'templates/*', '*.md', 'images/*'],
      tasks: ['sass', 'shell:dust_compile', 'shell:cp_images']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['sass', 'shell:dust_compile', 'shell:cp_images']);
};
