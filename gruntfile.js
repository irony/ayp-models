module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.initConfig({
    simplemocha:{
      dev:{
        src:"tests/test.js",
        options:{
          grep:'unit',
          reporter: 'spec',
          slow: 1000,
          timeout: 3000
        }
      }
    },
    clean: ["client/js/assets/", "client/css/assets/"],
    copy: {
      all: {
        files: [
          {expand: true, src: ['node_modules/socket.io-client/dist/socket.io.min.js'], dest: 'client/js/assets/', flatten: true},
          {expand: true, src: ['components/lodash/dist/lodash.min.js'], dest: 'client/js/assets/', flatten: true},
          
          {expand: true, src: ['components/angular/angular.min.js'], dest: 'client/js/assets/', flatten: true},
          {expand: true, src: ['components/*/*.min.js'], dest: 'client/js/assets/', flatten: true},
          {expand: true, src: ['components/async/lib/async.js'], dest: 'client/js/assets/', flatten: true},
          {expand: true, src: ['components/bootstrap/docs/assets/js/bootstrap.min.js'], dest: 'client/js/assets/', flatten: true},
          {expand: true, src: ['components/bootstrap/docs/assets/css/*.css'], dest: 'client/css/assets/', flatten: true},

          {expand: true, src: ['components/font-awesome/css/*.css'], dest: 'client/build/'},
          {expand: true, src: ['components/font-awesome/font/*.*'], dest: 'client/build/'},


        ]
      }
    },
    concat: {
      dist: {
        files :
        {
          'client/build/script.js' : ['client/js/*.js', 'client/controllers/*.js'],
          'client/build/assets.js' : ['client/js/assets/*.js'],
          'client/build/assets.css' : ['client/css/assets/*.css']
        }
      }
    },
    watch:{
      all:{

        files:['*.js','server/*.js', 'models/*.js', 'client/*.js', 'client/controllers/*.js', 'server/sockets/*.js', 'jobs/*.js', 'client/js/*.js', '-server/build/', 'tests/*.js'],
        tasks:['copy', 'concat', 'simplemocha:dev']
      },
      test:{
        files:['gruntfile.js', 'server/*.js', 'models/*.js', 'tests/*.js', 'client/js/*.js', 'jobs/*.js'],
        tasks:['simplemocha:dev']

      }
    },
    all: { src: ['test/**/*.js'] }
  });

  grunt.registerTask('build', ['copy', 'concat']);
  grunt.registerTask('default', ['copy', 'concat', 'watch:all']);
  grunt.registerTask('test', ['simplemocha:dev', 'watch:test']);



};