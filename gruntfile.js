module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-bowerful');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('assemble');

  grunt.initConfig({
    simplemocha:{
      dev:{
        src:"tests/test.js",
        options:{
          reporter: 'spec',
          slow: 1000,
          timeout: 3000
        }
      }
    },
    bowerful: {
      dist : {
        store: 'components',
        include : ['bootstrap', 'jquery', 'angular'],
        dest : 'client/build',
        packages: {
            bootstrap: '',
            jquery: '',
            angular : ''
        },
      }
    },
    concat: {
      dist: {
        src: ['client/js/*.js', 'client/controllers/*.js'],
        dest: 'client/build/script.js'
      }
    },
    watch:{
      all:{
        files:['server/*.js', 'models/*.js', 'client/*.js', ],
        tasks:['test', 'concat', 'bowerful']
      }
    },
    all: { src: ['test/**/*.js'] }
  });

  grunt.registerTask('default', ['concat', 'bowerful']);
  grunt.registerTask('test', 'simplemocha:dev');
  grunt.registerTask('watch', 'test, watch:all');



};