module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-eslint')
    grunt.initConfig({
        eslint: {
            options: {
                configFile: 'eslint-overrides.json',
                outputFile: 'eslint-output'
            },
            target: [
                '../../main/resources/aura/**/*.js',
                '!../../main/resources/aura/**/*_export.js'
            ]
        }
    });
    grunt.registerTask('default', ['eslint']);
};