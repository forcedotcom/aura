module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-eslint');
    grunt.initConfig({
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
                    outputFile: 'aura-components/target/eslint-output'
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
        }
    });
};