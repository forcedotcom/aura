module.exports = function (grunt) {

    var pom = grunt.file.read('pom.xml');
    var version = pom.match(/\<version\>(\d+\.\d+).+\<\/version\>/)[1];

    if (!version) {
        throw new Error('Coudn\'t extract Aura version!');
    }

    grunt.initConfig({
        version: version,
        env : {
          options : {
            //Shared Options Hash
          },
          configCDN : {
            AZURE_STORAGE_ACCOUNT : "account_here",
            AZURE_STORAGE_ACCESS_KEY : "access_key_here"
          }
        },
        eslint: {
            framework: {
                options: {
                    configFile: 'aura-impl/src/main/resources/aura/.eslintrc',
                    outputFile: 'aura-impl/target/eslint-output'
                },
                src: [
                    'aura-impl/src/main/resources/aura/**/*.js',
                    '!aura-impl/src/main/resources/aura/**/*_export.js'
                ]
            },
            components: {
                options: {
                    configFile: 'aura-components/src/main/components/.eslintrc',
                    outputFile: 'aura-components/target/eslint-output',
                    rulePaths: ['aura-components/src/rules']
                },
                src: [
                    'aura-components/src/main/components/aura',
                    'aura-components/src/main/components/auraadmmin',
                    'aura-components/src/main/components/auradev',
                    'aura-components/src/main/components/aurajstest',
                    'aura-components/src/main/components/auraStorage',
                    'aura-components/src/main/components/ui'
                ]
            }
        },
        'azure-blob': {
            options: { // global options applied to each task
                containerName: 'assetsblob',
                containerDelete: false, //do not apply true here, container would be deleted at each task
                metadata: {cacheControl: 'public, max-age=31556926'}, // max-age 1 year for all entries
                gzip: true,
                copySimulation: false  // set true: only dry-run what copy would look like
            },
            auraFramework: {
                files: [{
                    expand: true,
                    cwd: 'aura-resources/target/classes/aura/javascript/',
                    dest: '<%= version %>/js/aura/',
                    src: ['*.js']
                }]
            },
            libs: {
                files: [{
                    expand: true,
                    cwd: 'aura-resources/target/classes/aura/resources/',
                    dest: '<%= version %>/js/libs/',
                    src: ['libs_America-Los_Angeles*.js']
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-azure-blob');
    grunt.registerTask('azure-cdn', [/*'env:configCDN',*/ 'azure-blob']);
};