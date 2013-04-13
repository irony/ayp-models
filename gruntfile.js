module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-watch');

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
    watch:{
      all:{
        files:['server/*.js', 'models/*.js'],
        tasks:['test']
      }
    },
    all: { src: ['test/**/*.js'] }
  });

  grunt.registerTask('default', 'simplemocha:dev');
  grunt.registerTask('test', 'simplemocha:dev');
  grunt.registerTask('watch', 'test, watch:all');

};