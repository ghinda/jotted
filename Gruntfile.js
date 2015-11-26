'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};
var babel = require('rollup-plugin-babel');

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.loadNpmTasks('assemble');

  grunt.initConfig({
    watch: {
      grunt: {
        files: [ 'Gruntfile.js' ]
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          'build/{,*/}*.html',
          '{,site/**/}*.css',
          '{,test/**/,site/**/,src/}*.js'
        ]
      },
      js: {
        files: [
          'src/{,*/}*.js',
          'test/{,*/}*.js'
        ],
        tasks: [
          'standard',
          'rollup'
        ]
      },
      stylus: {
        files: [
          'src/*.styl'
        ],
        tasks: [ 'stylus:server' ]
      },
      assemble: {
        files: [
          'site/{,*/}*.{hbs,html,md}'
        ],
        tasks: [ 'assemble' ]
      }
    },
    connect: {
      options: {
        port: 9000,
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, './site/'),
              mountFolder(connect, './build/'),
              mountFolder(connect, './')
            ];
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, './build/')
            ];
          }
        }
      },
      test: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, './')
            ];
          }
        }
      }
    },
    standard: {
      options: {
        parser: 'babel-eslint'
      },
      server: {
        src: [
          'src/{,*/}*.js'
        ]
      }
    },
    stylus: {
      options: {
        compress: false
      },
      server: {
        files: {
          'jotted.css': 'src/jotted.styl'
        }
      },
      dist: {
        options: {
          compress: true,
        },
        files: {
          'jotted.min.css': 'src/jotted.styl'
        }
      }
    },
    rollup: {
      options: {
        sourceMap: true,
        plugins: [
          babel({
            exclude: 'node_modules/**'
          })
        ],
        format: 'umd',
        moduleName: 'Jotted'
      },
      files: {
        src: 'src/jotted.js',
        dest: 'jotted.js'
      }
    },
    uglify: {
      dist: {
        files: {
          'jotted.min.js': 'jotted.js'
        }
      }
    },
    'saucelabs-jasmine': {
      all: {
        options: {
          urls: [ 'http://127.0.0.1:9000/test' ],
          detailedError: true,
          browsers: [
            {
              browserName: 'chrome',
              platform: 'Linux'
            }, {
              browserName: 'firefox',
              platform: 'Linux'
            }, {
              browserName: 'opera',
              platform: 'Linux',
              version: '12.15'
            }, {
              browserName: 'android',
              platform: 'Linux',
              version: '4.0'
            }, {
              browserName: 'android',
              platform: 'Linux',
              version: '5.1'
            }, {
              browserName: 'internet explorer',
              platform: 'Windows 7',
              version: '8'
            }, {
              browserName: 'internet explorer',
              platform: 'Windows 7',
              version: '9'
            }, {
              browserName: 'internet explorer',
              platform: 'Windows 8',
              version: '10'
            }, {
              browserName: 'microsoftedge',
              platform: 'Windows 10'
            }, {
              browserName: 'safari',
              platform: 'OS X 10.10',
              version: '8'
            }, {
              browserName: 'iphone',
              platform: 'OS X 10.8',
              version: '5'
            }, {
              browserName: 'iphone',
              deviceName: 'iPhone 4s',
              platform: 'OS X 10.10',
              version: '8.0'
            }
          ]
        }
      }
    },
    assemble: {
      options: {
        layoutdir: 'site/layouts',
        partials: 'site/partials/*.md'
      },
      site: {
        files: [{
          expand: true,
          cwd: 'site',
          src: '{,*/}*.{hbs,md}',
          dest: 'build'
        }]
      }
    },
    clean: {
      site: {
        src: [
          'build/',
          './jotted.*'
        ]
      }
    },
    copy: {
      site: {
        files: [
          {
            expand: true,
            cwd: 'site/',
            src: [
              '**/*',
              '!**/*.{html,hbs,md}',
              'bower_components/**/*'
            ],
            dest: 'build/'
          }
        ]
      }
    },
    buildcontrol: {
      options: {
        dir: 'build',
        commit: true,
        push: true
      },
      site: {
        options: {
          remote: 'git@github.com:ghinda/jotted.git',
          branch: 'gh-pages'
        }
      }
    }
  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run([
        'build',
        'connect:dist:keepalive'
      ]);
    }

    grunt.task.run([
      'clean',
      'standard',
      'rollup',
      'stylus:server',
      'assemble',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'connect:test',
    'saucelabs-jasmine'
  ]);

  grunt.registerTask('build', [
    'standard',
    'uglify',
    'stylus',
    'clean',
    'assemble',
    'copy'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);

  grunt.registerTask('deploy', [
    'build',
    'buildcontrol'
  ]);

};
