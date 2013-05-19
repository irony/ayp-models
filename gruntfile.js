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
      all : {
        store: 'components',
        include : ['jquery','bootstrap', 'angular', 'font-awesome', 'moment'],
        dest : 'client/build',
        packages: {
            moment: '',
            jquery: '',
            bootstrap: '',
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
        files:['*.js','server/*.js', 'models/*.js', 'client/*.js', 'client/controllers/*.js', 'client/js/*.js'],
        tasks:['concat', 'bowerful']
      },
      test:{
        files:['*.js','server/*.js', 'models/*.js'],
        tasks:['simplemocha:dev']

      }
    },
    all: { src: ['test/**/*.js'] }
  });

  grunt.registerTask('default', ['concat', 'bowerful', 'watch:all']);
  grunt.registerTask('test', ['watch:test', 'simplemocha:dev']);



};