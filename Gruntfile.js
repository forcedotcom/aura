module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-eslint');
    grunt.initConfig({
        eslint: {
            auraImpl: {
                options: {
                    configFile: 'aura-impl/src/test/eslint/.eslintrc.json',
                    outputFile: 'aura-impl/target/eslint-output'
                },
                src: [
                    'aura-impl/src/main/resources/aura/**/*.js',
                    '!aura-impl/src/main/resources/aura/**/*_export.js'
                ]
            },
            auraComponents: {
                options: {
                    configFile: 'aura-components/src/test/eslint/.eslintrc.json',
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