module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-jshint');
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
    clean: ["client/build/"],
    copy: {
      all: {
        files: [
          {expand: true, src: ['bower_components/font-awesome/font/*.*'], dest: 'client/build/font/', flatten:true},
        ]
      }
    },
    concat: {
      dist: {
        files :
        {
          'client/build/js/app.js' : ['client/js/*.js', 'client/controllers/*.js','client/directives/*.js'  ],
          'client/build/css/app.css' : ['client/css/*.css'],
          'client/build/js/assets.js' : [
            'bower_components/jquery/jquery.min.js',
            'bower_components/angular/angular.min.js',
            'bower_components/async/lib/async.js',
            'bower_components/moment/min/moment.min.js',
            'bower_components/lodash/dist/lodash.min.js',
            'node_modules/socket.io-client/dist/socket.io.min.js',
            'bower_components/bootstrap/docs/assets/js/bootstrap.min.js'
          ],
          'client/build/css/assets.css' : [
            'bower_components/bootstrap/docs/assets/css/bootstrap.css',
            'bower_components/bootstrap/docs/assets/css/bootstrap-responsive.css',
            'bower_components/font-awesome/css/font-awesome.min.css'
          ]
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
  grunt.registerTask('default', ['clean', 'copy', 'concat', 'watch:all']);
  grunt.registerTask('test', ['simplemocha:dev', 'watch:test']);



};